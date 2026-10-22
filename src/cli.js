#!/usr/bin/env node
'use strict';

/**
 * wallaby-bulk-apikey CLI — mint Wallaby (wallabytoken.com) accounts and one API
 * key each, then prove every key with a real completion.
 *
 * Zero dependencies: Node builtins only. A real Chrome is required — Cloudflare
 * serves its managed challenge on `/register` and on the `POST /api/verification`
 * and `POST /api/user/register` routes, and that challenge is only ever cleared
 * by a *visible* (headful) browser: measured 2026-10-21 on the same exits at the
 * same hour, headless cleared 0/9 while headful cleared 3/3. So `--headless` is
 * off by default and the README says headful is mandatory.
 *
 * Flow per account (one exit, one browser tab, one mailbox):
 *   /register → clear the Cloudflare interstitial → Turnstile token for the
 *   panel's own sitekey → GET /api/verification (mails a code) → read the code
 *   from the temp.tf mailbox → POST /api/user/register → console Bearer JWT →
 *   /api/user/self (quota) → POST /api/token/ → POST /api/token/<id>/key →
 *   GET /v1/models + POST /v1/chat/completions (the key is written only now).
 *
 * Two panel quirks this tool encodes (both measured):
 *   • The Turnstile token must ride the *query string* (`?turnstile=`) — in the
 *     JSON body alone the register route answers `Turnstile token 为空`.
 *   • The console is authenticated with the `data.access_token` JWT from
 *     register/login (`Authorization: Bearer`); cookies alone answer 401.
 *
 * Usage:
 *   node src/cli.js --count 1
 *   node src/cli.js --count 5 --pool proxies.txt      # optional, one per line
 *   node src/cli.js --verify-only
 */

const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

const IS_SRC = path.basename(__dirname) === 'src';
const ROOT = IS_SRC ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');

const API_HOST = 'api.wallabytoken.com';
const BASE = `https://${API_HOST}`;
const SITEKEY_FALLBACK = '0x4AAAAAAEixRSWDSFH6GNDV';
const TEMPTF = 'https://temp.tf';
const MODEL_DEFAULT = 'kimi-k3';
const PROMPT = 'Reply with the single word: ok';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';
/**
 * The panel SPA is up when its root element has children. Challenge and error
 * pages have none, and Cloudflare localises the interstitial («Bir dakika
 * lütfen…» was measured on a `tr` Chrome), so the SPA itself is the only
 * language-independent signal that the wall is down.
 */
const SPA_READY = "!!document.querySelector('#root') && document.querySelector('#root').children.length > 0";
const HEALTHY = `location.hostname === '${API_HOST}' && ${SPA_READY} && !/ERR_|No internet|took too long/i.test(document.body ? document.body.innerText : '')`;

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt;
};
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name[0]}`);

const HELP = `wallaby-bulk-apikey — mint Wallaby API keys (one account per key)

  --count N        accounts to mint (default 1)
  --pool FILE      exit list, one proxy per line (default proxies.txt if present)
  --proxy URL      a single exit for every request
  --exits K        exit candidates tried per account (default 8)
  --model ID       model used for the live gate (default ${MODEL_DEFAULT})
  --port N         Chrome DevTools port (default: a free one)
  --headless       NOT recommended — Cloudflare only clears in a visible browser
  --keep           leave Chrome open when the run ends
  --verify-only    re-prove every key in keys.txt, mint nothing
  --help           this text

Env: WALLABY_MODEL, WALLABY_POOL, CHROME_PATH
Default exits: none — without a pool the tool runs direct.`;
if (has('help') || has('h') || argv.length === 0) { console.log(HELP); process.exit(0); }

const COUNT = Math.max(1, parseInt(arg('count', '1'), 10) || 1);
const MODEL = arg('model', process.env.WALLABY_MODEL || MODEL_DEFAULT);
const TRIES = Math.max(1, parseInt(arg('exits', '8'), 10) || 8);
const HEADLESS = has('headless');
const KEEP = has('keep');
const VERIFY_ONLY = has('verify-only');
const POOL_ARG = arg('pool', process.env.WALLABY_POOL || '');
const FIXED = arg('proxy', '');
const PORT_ARG = parseInt(arg('port', '0'), 10) || 0;
const CHROME_BIN = arg('browser', process.env.CHROME_PATH || '');
/** The code mail is Chinese and hex (`e8794e`), 10 minutes valid, ~15-25 s out. */
const CODE_WAIT_MS = Math.max(60000, (parseInt(arg('code-timeout', '360'), 10) || 360) * 1000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const randUser = () => `${['marcus', 'elena', 'tobias', 'nadia', 'julian', 'soraya', 'felix', 'iris', 'lena', 'maya'][crypto.randomBytes(1)[0] % 10]}${100 + (crypto.randomBytes(2).readUInt16BE(0) % 900)}`;
const randPass = () => `Wb${crypto.randomBytes(3).toString('hex')}${100 + (crypto.randomBytes(2).readUInt16BE(0) % 900)}!x`;

// --------------------------------------------------------------------- http
/** One request, no proxy. `body` is a JSON object or null. Returns {status,text,json}. */
function request(url, { method = 'GET', headers = {}, body = null, timeoutMs = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = https.request({
      host: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'user-agent': UA,
        accept: 'application/json',
        ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
        ...headers,
      },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { text += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(text); } catch (e) { /* html */ }
        resolve({ status: res.statusCode, text, json });
      });
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout after ${timeoutMs}ms`)));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const msgOf = (r) => (r.json && (r.json.message || (r.json.error && (r.json.error.message || r.json.error)) || r.json.detail)) || String(r.text || '').slice(0, 200);

// -------------------------------------------------------------------- exits
/** `protocol://host:port` (http / socks5 / socks4). Credentials are not supported. */
function parseProxy(line) {
  const s = String(line).trim().split(/\s+/)[0];
  const m = s.match(/^(?:(https?|socks5h?|socks4a?):\/\/)?([^:/@\s]+):(\d+)$/);
  if (!m) return null;
  const protocol = (m[1] || 'http').replace('socks5h', 'socks5').replace('socks4a', 'socks4');
  return { protocol, host: m[2], port: parseInt(m[3], 10), line: s };
}
const proxyLabel = (p) => (p ? `${p.protocol}://${p.host}:${p.port}` : '(direct)');
const chromeProxy = (p) => (p ? `${p.protocol}://${p.host}:${p.port}` : null);

function loadExits() {
  const file = FIXED ? '' : (POOL_ARG || (fs.existsSync(path.join(ROOT, 'proxies.txt')) ? path.join(ROOT, 'proxies.txt') : ''));
  if (FIXED) return [parseProxy(FIXED)].filter(Boolean);
  if (!file) return [];
  if (!fs.existsSync(file)) { log(`pool ${file} not found — running direct`); return []; }
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map(parseProxy)
    .filter(Boolean);
}

// --------------------------------------------------------------------- chrome
function findChrome() {
  if (CHROME_BIN && fs.existsSync(CHROME_BIN)) return CHROME_BIN;
  const candidates = [
    process.env['PROGRAMFILES'] && path.join(process.env['PROGRAMFILES'], 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Chromium/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['google-chrome'], { encoding: 'utf8' });
  const hit = String(probe.stdout || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
  if (hit && fs.existsSync(hit)) return hit;
  throw new Error('Chrome not found — set CHROME_PATH (headful Chrome is required, see README)');
}

const freePort = () => new Promise((resolve, reject) => {
  const srv = net.createServer();
  srv.on('error', reject);
  srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
});

/** Headful Chrome pinned to one exit. A fresh profile per run keeps sessions clean. */
async function launchChrome(exit, port) {
  const bin = findChrome();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'wallaby-chrome-'));
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-popup-blocking',
    '--disable-features=Translate,BackForwardCache,OptimizationHints',
    '--window-size=1280,900', '--window-position=40,40',
    // CF localises its interstitial to the browser language (a Turkish title
    // «Bir dakika lütfen…» tripped the wall detector on 2026-10-21): pin it.
    '--lang=en-US',
  ];
  const px = chromeProxy(exit);
  if (px) args.push(`--proxy-server=${px}`);
  // headless is a documented fallback only: Cloudflare does not clear there.
  if (HEADLESS) args.push('--headless=new');
  args.push('about:blank');
  const child = spawn(bin, args, { stdio: 'ignore', detached: false });
  child.on('error', (e) => log(`chrome error: ${e.message}`));
  await waitForCdp(port);
  return { child, profile, port };
}

async function waitForCdp(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await new Promise((resolve, reject) => {
        const req = require('http').get({ host: '127.0.0.1', port, path: '/json/version', timeout: 2000 },
          (res) => { let s = ''; res.on('data', (c) => { s += c; }); res.on('end', () => resolve(s)); });
        req.on('error', reject);
        req.setTimeout(2000, () => req.destroy(new Error('timeout')));
      });
      const j = JSON.parse(r);
      return j.webSocketDebuggerUrl;
    } catch (e) { await sleep(400); }
  }
  throw new Error(`Chrome DevTools did not answer on port ${port}`);
}

function killChrome(child, profile) {
  try { child.kill(); } catch (e) { /* gone */ }
  try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) { /* gone */ }
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* in use */ }
}

// ------------------------------------------------------------------------ CDP
/**
 * Flat page session over one WebSocket: newest Chrome exposes `/json/new` and a
 * page-scoped `webSocketDebuggerUrl`, so no session multiplexing is needed.
 * Node's global WebSocket exists from v22; older runtimes get a clear message.
 */
class Cdp {
  constructor(ws) {
    if (typeof WebSocket === 'undefined') throw new Error('Node 22+ is required (global WebSocket)');
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', (ev) => {
      let m = null;
      try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString()); } catch (e) { return; }
      if (m.id != null && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        if (m.error) reject(new Error(`${m.error.message} (${m.error.code})`)); else resolve(m.result);
      } else if (m.method && this.handlers.has(m.method)) {
        for (const h of this.handlers.get(m.method)) h(m.params);
      }
    });
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', (e) => reject(new Error(`cdp socket: ${e.message || 'error'}`)), { once: true });
    });
    return new Cdp(ws);
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP ${method} timeout`)); }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }

  close() { try { this.ws.close(); } catch (e) { /* gone */ } }
}

/** A tab inside the running Chrome, with the handful of helpers this flow needs. */
class Page {
  constructor(cdp) { this.cdp = cdp; }

  static async open(port) {
    const http = require('http');
    const json = (method, p) => new Promise((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port, path: p, method, timeout: 5000 }, (res) => {
        let s = ''; res.on('data', (c) => { s += c; }); res.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(new Error(`bad /json response: ${s.slice(0, 80)}`)); } });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => req.destroy(new Error('timeout')));
      req.end();
    });
    let target = null;
    try { target = await json('PUT', '/json/new?about:blank'); } catch (e) { target = await json('GET', '/json/new?about:blank'); }
    if (!target || !target.webSocketDebuggerUrl) throw new Error('could not open a Chrome tab');
    const page = new Page(await Cdp.connect(target.webSocketDebuggerUrl));
    await page.cdp.send('Page.enable');
    page.targetId = target.id;
    return page;
  }

  async eval(expression, timeoutMs = 30000) {
    const r = await this.cdp.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true, userGesture: true,
    }, timeoutMs);
    return r.result ? r.result.value : undefined;
  }

  async url() { return this.eval('location.href'); }

  async title() { return this.eval('document.title'); }

  /** Navigate and settle: load event, then a short beat for the SPA to paint. */
  async goto(url, { waitMs = 2500, timeoutMs = 45000 } = {}) {
    const loaded = new Promise((resolve) => {
      this.cdp.on('Page.loadEventFired', () => resolve(true));
      setTimeout(() => resolve(false), timeoutMs);
    });
    await this.cdp.send('Page.navigate', { url }, timeoutMs);
    await loaded;
    await sleep(waitMs);
  }

  async mouseClick(x, y) {
    const base = { x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 };
    await this.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...base }).catch(() => {});
    await this.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base }).catch(() => {});
    await sleep(60);
    await this.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base }).catch(() => {});
  }

  async waitFor(expression, { timeoutMs = 25000, pollMs = 1000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.eval(expression).catch(() => false)) return true;
      await sleep(pollMs);
    }
    return false;
  }

  close() { this.cdp.close(); }
}

// ------------------------------------------------------- Cloudflare / Turnstile
/** Every IFRAME reachable through closed shadow roots, with viewport quads. */
async function piercedFrames(cdp) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const nodes = [];
  const walk = (n) => {
    if (!n) return;
    if (String(n.nodeName || '').toLowerCase() === 'iframe') nodes.push(n);
    for (const c of n.children || []) walk(c);
    if (n.contentDocument) walk(n.contentDocument);
    for (const s of n.shadowRoots || []) walk(s);
  };
  walk(root);
  const out = [];
  for (const n of nodes) {
    let quads = [];
    try { quads = (await cdp.send('DOM.getContentQuads', { nodeId: n.nodeId })).quads || []; } catch (e) { /* invisible */ }
    const q = quads && quads[0];
    out.push({
      box: q ? {
        x: Math.round(Math.min(q[0], q[4] ?? q[0])),
        y: Math.round(Math.min(q[1], q[5] ?? q[1])),
        w: Math.round(Math.abs(q[2] - q[0])),
        h: Math.round(Math.abs(q[5] - q[1])),
      } : null,
    });
  }
  return out;
}

/** Click the interstitial's widget until the panel SPA is actually up. */
async function ensureClear(cdp, page, { rounds = 14 } = {}) {
  const ready = () => page.eval(SPA_READY).then((v) => v === true).catch(() => false);
  let title = await page.title().catch(() => '');
  if (await ready()) return { cleared: true, rounds: 0, title };
  for (let n = 1; n <= rounds; n++) {
    const boxes = (await piercedFrames(cdp).catch(() => []))
      .filter((f) => f.box && f.box.w > 20 && f.box.h > 15 && f.box.w < 700 && f.box.h < 300);
    log(`  [cf] round ${n}/${rounds} clickable=${boxes.length} «${String(title).slice(0, 40)}»`);
    for (const b of boxes) {
      await page.mouseClick(b.box.x + Math.round(b.box.w * 0.14), b.box.y + Math.round(b.box.h / 2));
      await sleep(2500);
      if (await ready()) return { cleared: true, rounds: n, title: await page.title().catch(() => '') };
    }
    await sleep(2000);
    if (await ready()) return { cleared: true, rounds: n, title: await page.title().catch(() => '') };
    title = await page.title().catch(() => '');
  }
  return { cleared: false, rounds, title };
}

const READ_NATIVE = '(document.querySelector(\'[name="cf-turnstile-response"]\') || {}).value || ""';
const READ_ANY = `(() => { try { if (window.__wbMount && window.__wbId != null && typeof turnstile !== 'undefined') return turnstile.getResponse(window.__wbId) || window.__wbMount; } catch (e) {} return document.querySelector('[name="cf-turnstile-response"]') ? document.querySelector('[name="cf-turnstile-response"]').value : ''; })()`;
const MOUNT_TURNSTILE = (sitekey) => `(async () => {
  const put = (div) => new Promise((resolve) => {
    const go = () => { try { window.__wbId = turnstile.render(div, { sitekey: ${JSON.stringify(sitekey)}, callback: (t) => { window.__wbMount = t; }, 'error-callback': () => {} }); resolve(true); } catch (e) { resolve(false); } };
    go();
  });
  if (typeof turnstile === 'undefined') {
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.onload = () => setTimeout(resolve, 1500);
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }
  const div = document.createElement('div');
  div.id = '__wb_box';
  div.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#fff';
  document.body.appendChild(div);
  return put(div);
})()`;

/**
 * A Turnstile token for the panel's sitekey: the page's own widget first (it
 * usually answers on its own — measured 773-794 char tokens), then an explicit
 * mount clicked in the same rhythm the lab uses (two clicks per widget box per
 * round, 1 s apart).
 */
async function obtainToken(cdp, page, sitekey, label = 'ts') {
  // 14 rounds is 4x the worst case measured on 2026-10-21 (every token arrived
  // within 5 mount attempts, most of them natively): a longer loop only
  // stretches the per-attempt cost when an exit is bad.
  const ROUNDS = 14;
  for (let t = 0; t < 8; t++) {
    const tok = await page.eval(READ_NATIVE).catch(() => '');
    if (tok && tok.length > 20) return { token: tok, via: 'native' };
    await sleep(2000);
  }
  await page.eval(MOUNT_TURNSTILE(sitekey)).catch(() => {});
  let clicks = 0;
  for (let round = 1; round <= ROUNDS; round++) {
    const boxes = (await piercedFrames(cdp).catch(() => []))
      .filter((f) => f.box && f.box.w > 20 && f.box.h > 15 && f.box.w < 600 && f.box.h < 200);
    if (round === 1 || round % 5 === 0) log(`  [${label}] click round ${round}/${ROUNDS} boxes=${boxes.length}`);
    if (!boxes.length) { await sleep(1500); continue; }
    for (const b of boxes) {
      for (const frac of [0.12, 0.5]) {
        await page.mouseClick(b.box.x + Math.round(b.box.w * frac), b.box.y + Math.round(b.box.h / 2));
        clicks++;
        await sleep(1000);
        const tok = await page.eval(READ_ANY).catch(() => '');
        if (tok && tok.length > 20) return { token: tok, via: 'click', clicks };
      }
    }
    await sleep(1500);
  }
  return { token: '', via: 'none', clicks };
}

// ---------------------------------------------------------------------- mail
/** temp.tf: real Microsoft-family mailboxes, one plus-alias per account, JSON reader. */
class Mailbox {
  constructor(address = null) { this.address = address; }

  async #call(method, p, body) {
    for (let i = 0; i < 4; i++) {
      const r = await request(TEMPTF + p, { method, body, timeoutMs: 30000 }).catch((e) => ({ error: e }));
      if (r.error) { await sleep(1500); continue; }
      if (r.status === 200) return r.json;
      if (r.status === 429) { await sleep(20000); continue; }
      throw new Error(`temp.tf ${p} → ${r.status} ${String(r.text).slice(0, 120)}`);
    }
    throw new Error(`temp.tf ${p}: no answer after retries`);
  }

  /** One fresh alias on a live Outlook/Hotmail pool account. */
  async open() {
    const j = await this.#call('GET', '/api/account?providers=outlook,hotmail&dot=0&plus=1');
    const address = String((j && j.email) || '').trim();
    if (!/@/.test(address)) throw new Error(`temp.tf: no address in ${JSON.stringify(j).slice(0, 120)}`);
    this.address = address;
    return address;
  }

  async messages() {
    if (!this.address) throw new Error('mailbox: open() first');
    const j = await this.#call('POST', '/api/check', { email: this.address, wait: false });
    const list = Array.isArray(j) ? j : (j && (j.data || j.messages)) || [];
    return list.map((m, i) => ({
      id: String(m.id || i),
      subject: String(m.subject || ''),
      from: String(m.from || ''),
      text: String(m.text || m.body || m.html || '').replace(/<[^>]+>/g, ' '),
    }));
  }

  /** The panel mails a 6-character code (hex in the samples), valid 10 minutes. */
  async waitForCode({ timeoutMs = CODE_WAIT_MS, pollMs = 6000 } = {}) {
    const deadline = Date.now() + timeoutMs;
    const seen = new Set();
    while (Date.now() < deadline) {
      for (const m of await this.messages()) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        const code = extractCode(m.subject, m.text);
        if (code) return { code, subject: m.subject };
      }
      await sleep(pollMs);
    }
    throw new Error(`no verification mail in ${this.address} within ${Math.round(timeoutMs / 1000)}s`);
  }
}

const CODE_NEAR_RE = /(?:code|verification|验证码)[^0-9a-z]{1,24}(?=[0-9a-z]*\d)([0-9a-z]{4,8})(?![0-9a-z])/i;
const CODE_ANY_RE = /(?:^|[^0-9a-z])(?=[0-9a-f]*\d)([0-9a-f]{4,8})(?![0-9a-z])/i;
function extractCode(subject, text) {
  const hay = `${subject} ${text}`;
  const m = hay.match(CODE_NEAR_RE) || hay.match(CODE_ANY_RE);
  return m ? m[1] : null;
}

// -------------------------------------------------------------------- account
let AUTH = null; // this fork authenticates the console with a Bearer JWT

/** Same-origin in-page fetch: it inherits the cf_clearance cookie, UA and exit IP. */
async function api(page, p, { method = 'GET', body = null } = {}) {
  const r = await page.eval(`(async () => {
    const res = await fetch(${JSON.stringify(BASE + p)}, { method: ${JSON.stringify(method)}, credentials: 'include',
      headers: { 'Content-Type': 'application/json'${AUTH ? `, Authorization: 'Bearer ${AUTH}'` : ''} }${body ? `, body: ${JSON.stringify(JSON.stringify(body))}` : ''} });
    return { status: res.status, body: await res.text() };
  })()`);
  let json = null;
  try { json = JSON.parse(r.body); } catch (e) { /* html (cloudflare) */ }
  return { status: r.status, json, text: String(r.body).slice(0, 1200) };
}

/** One account, end to end, on one exit. Returns {email,password,key,quota,...}. */
async function mintOnExit(page, exit, sitekey) {
  const box = new Mailbox();
  let email = await box.open();
  const username = randUser();
  const password = randPass();
  log(`  box ${email} user=${username}`);
  const rec = { email, username, password, exit: proxyLabel(exit) };

  await page.goto(`${BASE}/register`, { waitMs: 3000 });
  const clear = await ensureClear(page.cdp, page);
  log(`  [cf] cleared=${clear.cleared} rounds=${clear.rounds} «${clear.title}»`);
  if (!clear.cleared) throw new Error('interstitial-stuck');
  if (!(await page.waitFor(HEALTHY, { timeoutMs: 25000 }))) throw new Error('page-unhealthy-after-clear');

  // temp.tf hands out plus-aliases on a shared pool, so a base mailbox can
  // already carry an account: the panel answers `An account with this email
  // address already exists` and the cure is a fresh alias, not a new exit.
  for (let attempt = 1; ; attempt++) {
    const t1 = await obtainToken(page.cdp, page, sitekey, `ts1.${attempt}`);
    log(`  ts1 ${t1.token.length}(${t1.via})`);
    if (!t1.token) throw new Error('turnstile-token-empty');
    const send = await api(page, `/api/verification?email=${encodeURIComponent(email)}&turnstile=${encodeURIComponent(t1.token)}`);
    log(`  send-code → ${send.status} ${msgOf(send)}`);
    if (send.json && send.json.success) break;
    if (!/already exists/i.test(msgOf(send)) || attempt >= 3) throw new Error(`send-code-failed: ${msgOf(send)}`);
    email = await box.open();
    rec.email = email;
    log(`  mailbox already registered → fresh alias ${email}`);
  }
  const mail = await box.waitForCode();
  log(`  code ${mail.code} «${String(mail.subject).slice(0, 50)}»`);

  // The TurnstileCheck middleware reads the token from the query string only.
  const t2 = await obtainToken(page.cdp, page, sitekey, 'ts2');
  log(`  ts2 ${t2.token.length}(${t2.via})`);
  const reg = await api(page, `/api/user/register?turnstile=${encodeURIComponent(t2.token)}`, {
    method: 'POST',
    body: { username, password, email, verification_code: String(mail.code), aff_code: '', turnstile: t2.token },
  });
  log(`  register → ${reg.status} ${msgOf(reg)}`);
  if (!(reg.json && reg.json.success)) throw new Error(`register-failed: ${msgOf(reg)}`);
  AUTH = (reg.json.data && reg.json.data.access_token) || AUTH;

  let self = await api(page, '/api/user/self');
  if (self.status !== 200) {
    const t3 = await obtainToken(page.cdp, page, sitekey, 'ts3');
    const li = await api(page, `/api/user/login?turnstile=${encodeURIComponent(t3.token)}`, { method: 'POST', body: { username, password } });
    log(`  login → ${li.status} ${msgOf(li)}`);
    AUTH = (li.json && li.json.data && li.json.data.access_token) || AUTH;
    self = await api(page, '/api/user/self');
  }
  rec.quota = self.json && self.json.data && (self.json.data.quota ?? null);
  log(`  self → ${self.status} quota=${rec.quota}`);

  await api(page, '/api/token/', {
    method: 'POST',
    body: { name: `wb${Date.now().toString(36)}`, remain_quota: 0, expired_time: -1, unlimited_quota: true, model_limits_enabled: false, model_limits: '', allow_ips: '', group: 'default' },
  });
  // This fork answers the create call without a key and masks it in the list
  // (`zcMh**********UCAK`); the plaintext only comes from /api/token/<id>/key.
  const list = await api(page, '/api/token/?p=0&size=100');
  const items = (list.json && list.json.data && (list.json.data.items || list.json.data)) || [];
  const first = items[0] || null;
  if (!first || !first.id) throw new Error('no token in the console');
  const kk = await api(page, `/api/token/${first.id}/key`, { method: 'POST', body: {} });
  const key = kk.json && kk.json.data && (kk.json.data.key || kk.json.data);
  if (typeof key !== 'string' || key.includes('*')) throw new Error(`token key not readable: ${String(kk.text).slice(0, 120)}`);
  rec.key = key;
  log(`  key ${key.slice(0, 10)}…`);
  return rec;
}

// ----------------------------------------------------------------------- proof
/** `GET /v1/models` + a real completion; a reasoning model may answer with reasoning only. */
async function proveKey(key, model = MODEL) {
  const auth = { authorization: `Bearer ${key}` };
  const models = await request(`${BASE}/v1/models`, { headers: auth });
  const ids = ((models.json && models.json.data) || []).map((m) => m.id);
  const out = { models: { status: models.status, ids }, chat: null };
  if (models.status !== 200) return out;
  for (const id of [model, ...ids.filter((i) => /kimi|k3/i.test(i))].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3)) {
    const chat = await request(`${BASE}/v1/chat/completions`, {
      method: 'POST', headers: auth,
      body: { model: id, messages: [{ role: 'user', content: PROMPT }], max_tokens: 64, stream: false },
    });
    const m = chat.json && chat.json.choices && chat.json.choices[0] && chat.json.choices[0].message;
    const answer = m && (m.content || m.reasoning_content);
    out.chat = { model: id, status: chat.status, content: answer || null, usage: (chat.json && chat.json.usage) || null };
    if (chat.status === 200 && answer) { out.live = true; break; }
    if (!out.chat.content) out.chat.text = String(chat.text || '').slice(0, 200);
  }
  return out;
}

const readKeys = () => fs.existsSync(KEYS_FILE)
  ? fs.readFileSync(KEYS_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : [];
const appendKey = (key) => {
  if (readKeys().includes(key)) return false;
  fs.appendFileSync(KEYS_FILE, (fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '\n' : '') + key + '\n');
  return true;
};
const readAccounts = () => { try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')); } catch (e) { return []; } };
const saveAccount = (rec) => {
  const all = readAccounts();
  all.push(rec);
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(all, null, 2) + '\n');
};

// ----------------------------------------------------------------------- modes
async function sitekey() {
  const r = await request(`${BASE}/api/status`).catch(() => null);
  const k = r && r.json && r.json.data && r.json.data.turnstile_site_key;
  return k || SITEKEY_FALLBACK;
}


/**
 * Chrome pins its proxy at launch, so each attempt gets its own browser instance
 * on that attempt's exit: one account, one exit, one browser, one tab.
 */
async function mint(exits, count) {
  const sk = await sitekey();
  log(`sitekey ${sk} · model ${MODEL} · ${exits.length ? `${exits.length} exit(s)` : 'DIRECT (no proxy)'} · ${HEADLESS ? 'headless (NOT recommended)' : 'headful'}`);
  let minted = 0;
  for (let n = 1; n <= count; n++) {
    const attempts = Math.max(1, exits.length);
    for (let k = 0; k < attempts; k++) {
      const exit = exits.length ? exits[(n - 1 + k) % exits.length] : null;
      const port = PORT_ARG || await freePort();
      const chrome = await launchChrome(exit, port).catch((e) => { log(`chrome failed: ${e.message}`); return null; });
      if (!chrome) break;
      let page = null;
      try {
        page = await Page.open(port);
        const rec = await mintOnExit(page, exit, sk);
        const proof = await proveKey(rec.key);
        rec.proof = proof;
        rec.at = new Date().toISOString();
        if (!proof.live) {
          rec.status = 'key-unverified';
          saveAccount(rec);
          log(`  ✖ key not proven: ${JSON.stringify(proof.chat || proof.models).slice(0, 200)}`);
          continue;
        }
        rec.status = 'minted';
        appendKey(rec.key);
        saveAccount(rec);
        minted++;
        log(`  ✔ key ${n}/${count} live — models=${proof.models.status}(${proof.models.ids.length}) chat[${proof.chat.model}]=${proof.chat.status}`);
        break;
      } catch (e) {
        log(`  ✖ ${proxyLabel(exit)}: ${String(e.message).slice(0, 160)}`);
        if (k + 1 >= attempts) log(`  ✖ giving up on account ${n}/${count}`);
      } finally {
        if (page) page.close();
        if (!KEEP) killChrome(chrome.child, chrome.profile);
        else log(`chrome kept on ${port} (exit ${proxyLabel(exit)})`);
      }
    }
  }
  log(`done: ${minted}/${count} keys minted`);
  if (minted) log(`keys.txt → ${KEYS_FILE}`);
}

async function verifyOnly() {
  const keys = readKeys();
  if (!keys.length) { log(`no keys in ${KEYS_FILE}`); return; }
  let live = 0;
  for (const key of keys) {
    const proof = await proveKey(key);
    if (proof.live) live++;
    log(`${key.slice(0, 10)}… models=${proof.models.status}(${proof.models.ids.length}) chat=${proof.chat ? `${proof.chat.model}:${proof.chat.status}` : 'n/a'} ${proof.live ? 'LIVE' : 'DEAD'}`);
  }
  log(`live: ${live}/${keys.length}`);
}

// ------------------------------------------------------------------------ main
(async () => {
  const exits = loadExits();
  if (VERIFY_ONLY) return verifyOnly();
  if (!exits.length) log('running WITHOUT a proxy (direct) — pass --pool proxies.txt to rotate exits');
  await mint(exits, COUNT);
})().catch((e) => { console.error('FATAL', e && e.message ? e.message : e); process.exit(1); });

module.exports = { parseProxy, extractCode, Mailbox, Page, Cdp, proveKey, ensureClear, obtainToken, request };
