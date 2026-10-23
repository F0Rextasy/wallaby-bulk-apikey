<div align="center">

```
██╗    ██╗ █████╗ ██╗     ██╗      █████╗ ██████╗ ██╗   ██╗
██║    ██║██╔══██╗██║     ██║     ██╔══██╗██╔══██╗╚██╗ ██╔╝
██║ █╗ ██║███████║██║     ██║     ███████║██████╔╝ ╚████╔╝
██║███╗██║██╔══██║██║     ██║     ██╔══██║██╔══██╗  ╚██╔╝
╚███╔███╔╝██║  ██║███████╗███████╗██║  ██║██████╔╝   ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝
```

# wallaby-bulk-apikey

**Bulk-create Wallaby accounts with API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-2-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Wallaby (wallabytoken.com) is a Sydney-run inference layer that resells frontier open-weight models on prepaid USD, and **every new account starts with $0.50 of free trial credit** — no card, no phone, no top-up. Today the catalogue is a single model, **`kimi-k3`** (1M context, always-on reasoning), billed at **$2.70 in / $13.50 out per 1M tokens** ($0.27 cached) — 10% under the official Kimi list price.

The panel is a New API fork behind **Cloudflare**, and Cloudflare is the whole difficulty: `/register` answers a managed challenge, and `POST /api/verification` plus `POST /api/user/register` are challenged too — so no key exists without a browser that holds `cf_clearance`. Worse, the challenge is only cleared by a **visible** browser: measured on the same exits at the same hour, headless cleared **0/9** and headful cleared **3/3**. That is why this tool drives a real, headful Chrome (the README repeats it, because a headless run looks exactly like a broken panel) and why one account costs a couple of minutes rather than a second.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Signup credit | **$0.50** — read back from the console as `quota = 250000` (`quota_per_unit = 500000`, USD 1:1) |
| Card / phone | **neither** — e-mail address + password + a mailed code + a human check |
| Expiry | **never** (“no card · no top-up · never expires”) |
| Models on the free tier | **`kimi-k3`** (+ alias `moonshotai/kimi-k3`); DeepSeek V4 Flash/Pro are listed as temporarily unavailable |
| Price | $2.70 in / $13.50 out / $0.27 cached per 1M (official Kimi list **−10%**) |
| Rate limit | **none seen** — a 30-call burst answered 28×200 with no 429 at all (the other two were proxy failures) |
| The unit that scales | **one account = one key**; the credit lives on the account, so keys = 10 × $0.50 |

> 💡 The free tier is set by Wallaby and can change. Check the live numbers at [wallabytoken.com](https://wallabytoken.com) — and let the tool's own gate decide:

```bash
```bash
# every key in keys.txt: the model list plus one real completion
node src/cli.js --verify-only

# or by hand (keys carry no `sk-` prefix)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer 3I7ulkrQVXR1YL…" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` is a reasoning model: a small `max_tokens` is consumed by `reasoning_tokens` and `content` comes back `null` even though the call succeeded — this tool counts `content || reasoning_content` as proof of life for exactly that reason.
```

## 🤖 Models — all 2 of them

`GET /v1/models` on a live key (2026-10-21):

| Model ID | Note |
| --- | --- |
| `kimi-k3` | the model this provider exists for — 1M context, open-weight reasoning, thinking billed as output |
| `moonshotai/kimi-k3` | the same model under its upstream id |

Responses name the serving stack rather than the alias — `"model": "FW-Kimi-K3"` and `"model": "accounts/fireworks/models/kimi-k3"` — so the backend is Fireworks. The provider publishes a machine-readable price list at [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json).

## 🧪 How to use the API

Base URL **`https://api.wallabytoken.com/v1`** — OpenAI-compatible, and the provider's own docs say the migration is two lines (`base_url` and the key).

Keys are **48 characters with no `sk-` prefix**; auth is a bearer token on every request.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="<your key>")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

The site's docs promise no rate-limit ceiling on the free tier; the measurement agrees (30 rapid calls, zero 429s, 2-36 s latencies with an upstream tail).

## 🛠 Quick start

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 1                    # one account, end to end, in a visible Chrome
node src/cli.js --count 5 --pool proxies.txt # five accounts, one exit each
node src/cli.js --verify-only                # re-prove every key already in keys.txt
```

**A visible (headful) browser is mandatory** — Cloudflare's interstitial on `/register` does not clear in headless Chrome, and the challenge also guards `POST /api/verification` and `POST /api/user/register`. Hence the flag is *off*: `--headless` exists only for experiments.

A key is written to `keys.txt` **only after** `GET /v1/models` and a real completion answered, and every account (mailbox, exit, quota, key, proof) is appended to `accounts.json`.

### 🖱️ The launcher

The launcher asks for the proxy list (optional — without one the CLI runs direct) and the account count, remembers both, and runs the CLI. `--verify-only` re-proves the keys already in `keys.txt`.

## ✅ Verified working — every key is tested

Every check below ran on **2026-10-21** over fresh public exits (no VPN in the loop). The mint flow was driven by the lab's pinned driver for the first ten keys and by **this package's own CLI end to end for key #11** (`node src/cli.js --count 1` → `done: every key minted`), and the whole file was re-proved by **`node src/cli.js --verify-only`**.

| Check | Result |
| --- | --- |
| `/register` interstitial in a **headful** Chrome | **cleared** — 2–14 click rounds, on every exit that made it through |
| headless control on those exits | **0/9 clears** at the same hour — this is why the flag is off by default |
| localised challenge | CF serves the interstitial in the browser's language («Bir dakika lütfen…» on a `tr` Chrome, measured 2026-10-21) → the detector tests the **panel SPA root**, not the title, and Chrome is pinned to `--lang=en-US` |
| mailed code | **~15–25 s** from `support@wallabytoken.com` («Wallaby邮箱验证邮件»), 6-character code, valid 10 minutes |
| `POST /api/user/register?turnstile=` | **200** with `data.access_token` (JWT); a token in the body alone answers `Turnstile token 为空` |
| console session | **Bearer JWT** — `/api/user/self` 401s without it, 200 with it (`quota = 250000`) |
| key route | `POST /api/token/` 200 (no key in the body) → list returns it **masked** → `POST /api/token/<id>/key` returns the 48-char plaintext |
| `GET /v1/models` per key | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| `POST /v1/chat/completions` per key | **200** with `content \|\| reasoning_content` — **every key verified** |
| signup credit | `quota = 250000` = **$0.50**, no card/phone/invite |
| rate limit | 30-call burst **28×200**, 2 proxy failures, **0×429** |
| throughput | **~2–2.5 min per account** on a good exit; a bad exit is skipped, worst case ~5 min |

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| mailbox | temp.tf alias (`outlook`/`hotmail` plus-alias) | one address per account; the panel rejects 9 890 disposable domains, and this family is a real Microsoft mailbox |
| interstitial | `/register` in a **headful** Chrome | the widget lives in a closed shadow root, so the DOM is pierced (`DOM.getDocument {pierce:true}`) and the box is clicked with real mouse events; 4–10 rounds |
| turnstile | the panel's own widget (`turnstile_sitekey` from `/api/status`) | read natively when the page solves it (773–794 char tokens), otherwise mounted and clicked in the same rhythm |
| code | `GET /api/verification?email=&turnstile=` → mailed code | the token must ride the **query string**; in the body alone the route answers `Turnstile token 为空` |
| register | `POST /api/user/register?turnstile=` | mails a 6-character code (hex in every sample, valid 10 minutes, delivered in ~15–25 s from `support@wallabytoken.com`) |
| session | the `data.access_token` JWT from register/login | the console is authenticated with **Bearer**, not cookies: `/api/user/self` answers `401 invalid access token` without the header |
| key | `POST /api/token/` → `POST /api/token/<id>/key` | create answers 200 **without** a key and the list returns it **masked** (`zcMh**********UCAK`); the plaintext only comes from the `/key` route |
| proof | `GET /v1/models` + `POST /v1/chat/completions` | direct from Node — the relay does not challenge `/v1/*`; `content || reasoning_content` counts |

## ⚙️ CLI options

```bash
node src/cli.js --count N        # accounts to mint (serial)
node src/cli.js --pool proxies.txt
node src/cli.js --proxy socks5://host:port
node src/cli.js --exits K        # exit candidates tried per account
node src/cli.js --model kimi-k3
node src/cli.js --verify-only
node src/cli.js --headless       # NOT recommended — see above
node src/cli.js --help
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--count N` | `1` | accounts to mint, one browser at a time |
| `--pool FILE` | `proxies.txt` if present | one exit per line (`http://`, `socks5://`); without it the run is direct |
| `--proxy URL` | — | pin a single exit |
| `--exits K` | `8` | how many candidate exits an account may burn before it is given up |
| `--model ID` | `kimi-k3` | model used for the live gate |
| `--port N` | auto | Chrome DevTools port |
| `--headless` | off | only for experiments: Cloudflare will not clear |
| `--keep` | off | leave Chrome open when the run ends |
| `--code-timeout S` | `360` | how long to wait for the mailed code |

## 🛰️ Behind a proxy

**Optional — recommended at scale.** Without a pool the CLI says so and connects directly; sign-up, key minting and verification are identical, only the packets' origin changes.

With a pool, every attempt gets **its own browser pinned to that exit** (Chrome fixes its proxy at launch), so an exit that cannot clear the interstitial only costs its own attempt and the CLI moves to the next candidate. The exits that work are the ones whose IP class Cloudflare tolerates with a visible browser; dead lines show up as `page-unhealthy-after-clear` or a `chrome-error` page and are skipped.

Authenticated HTTP proxies are supported by the browser leg (a 407 is answered in-browser); IP-allowlisted exits work too. — use IP-allowlisted exits. Rotate the list: the best exit of one hour is often dead the next (measured 2026-10-21: the day's most reliable exit stopped answering within hours).

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-proven key per line — git-ignored |
| `keys-dead.txt` | keys the API refused (`401`/`403`/`quota`) — `key<TAB>why<TAB>ISO` — git-ignored |
| `accounts.json` | mailbox, exit, quota, key and the gate result — appended per account — git-ignored |
| `proxies.txt` | your exits, one per line — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Defaults: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Models are served as `wallaby/kimi-k3`.

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Defaults: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Models are served as `wallaby/kimi-k3`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 What the provider gives | one account per key — $0.50 signup credit, kimi-k3 chat-verified (a visible browser is mandatory) |
| 🔑 What one key gets you | one API key scoped to its own account: the 2 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 Your data | only wallabytoken.com and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

If Wallaby changes its register shape, its Turnstile sitekey, the console key route or the catalogue, the tool stops at that step and says so. **[Open an issue](../../issues)** with the command and the exact output.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>
