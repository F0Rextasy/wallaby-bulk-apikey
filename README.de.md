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

**Wallaby-Konten mit API-Schlüsseln im Bulk erstellen — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-2-of-them) · [🧪 Die API nutzen](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Wallaby (wallabytoken.com) ist eine in Sydney betriebene Inferenz-Schicht, die Frontier-Open-Weight-Modelle auf Prepaid-USD-Basis weiterverkauft, und **jedes neue Konto startet mit 0,50 $ kostenlosem Testguthaben** — keine Karte, kein Telefon, kein Aufladen. Derzeit besteht der Katalog aus einem einzigen Modell, **`kimi-k3`** (1M Kontext, Always-on-Reasoning), abgerechnet mit **2,70 $ Input / 13,50 $ Output pro 1M Tokens** (0,27 $ gecacht) — 10 % unter dem offiziellen Kimi-Listenpreis.

Das Panel ist ein New-API-Fork hinter **Cloudflare**, und Cloudflare ist die ganze Schwierigkeit: `/register` antwortet mit einer Managed Challenge, und `POST /api/verification` sowie `POST /api/user/register` sind ebenfalls geschützt — es existiert also kein Schlüssel ohne einen Browser, der `cf_clearance` hält. Schlimmer noch: Die Challenge wird nur von einem **sichtbaren** Browser gelöst: Gemessen an denselben Ausgängen zur selben Stunde löste Headless **0/9** und Headful **3/3**. Deshalb steuert dieses Tool ein echtes, sichtbares Chrome (das README wiederholt es, weil ein Headless-Lauf genau wie ein kaputtes Panel aussieht) und deshalb kostet ein Konto ein paar Minuten statt einer Sekunde.

## 🎁 Free-Tier — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Anmeldeguthaben | **0,50 $** — aus der Konsole als `quota = 250000` zurückgelesen (`quota_per_unit = 500000`, USD 1:1) |
| Karte / Telefon | **keines von beiden** — E-Mail-Adresse + Passwort + ein per Mail gesendeter Code + eine menschliche Prüfung |
| Ablauf | **nie** („no card · no top-up · never expires“) |
| Modelle im Free-Tier | **`kimi-k3`** (+ Alias `moonshotai/kimi-k3`); DeepSeek V4 Flash/Pro sind als vorübergehend nicht verfügbar gelistet |
| Preis | 2,70 $ Input / 13,50 $ Output / 0,27 $ gecacht pro 1M (offizieller Kimi-Listenpreis **−10 %**) |
| Rate-Limit | **keines festgestellt** — ein Burst von 30 Aufrufen antwortete 28×200 ohne jegliche 429 (die anderen zwei waren Proxy-Fehler) |
| Die skalierende Einheit | **ein Konto = ein Schlüssel**; das Guthaben liegt auf dem Konto, also Schlüssel = 10 × 0,50 $ |

> 💡 Das Free-Tier wird von Wallaby festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [wallabytoken.com](https://wallabytoken.com) — und lass das eigene Gate des Tools entscheiden:

```bash
```bash

# every key in keys.txt: the model list plus one real completion
node src/cli.js --verify-only

# or by hand (keys carry no `sk-` prefix)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer 3I7ulkrQVXR1YL…" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` ist ein Reasoning-Modell: Ein kleines `max_tokens` wird von `reasoning_tokens` aufgebraucht und `content` kommt als `null` zurück, obwohl der Aufruf erfolgreich war — dieses Tool zählt aus genau diesem Grund `content || reasoning_content` als Lebenszeichen.
```

## 🤖 Modelle — alle 2 davon

`GET /v1/models` mit einem aktiven Schlüssel (2026-10-21):

| Modell-ID | Hinweis |
| --- | --- |
| `kimi-k3` | das Modell, für das es diesen Anbieter gibt — 1M Kontext, Open-Weight-Reasoning, Thinking wird als Output abgerechnet |
| `moonshotai/kimi-k3` | dasselbe Modell unter seiner Upstream-ID |

Antworten nennen den Serving-Stack statt des Alias — `"model": "FW-Kimi-K3"` und `"model": "accounts/fireworks/models/kimi-k3"` — das Backend ist also Fireworks. Der Anbieter veröffentlicht eine maschinenlesbare Preisliste unter [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json).

## 🧪 Die API nutzen

Basis-URL **`https://api.wallabytoken.com/v1`** — OpenAI-kompatibel, und die eigene Doku des Anbieters sagt, die Migration besteht aus zwei Zeilen (`base_url` und der Schlüssel).

Schlüssel sind **48 Zeichen ohne `sk-`-Präfix**; die Authentifizierung erfolgt bei jeder Anfrage über ein Bearer-Token.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="<your key>")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

Die Doku der Seite verspricht keine Rate-Limit-Obergrenze im Free-Tier; die Messung stimmt zu (30 schnelle Aufrufe, null 429er, Latenzen von 2–36 s mit einem Upstream-Tail).

## 🛠 Schnellstart

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 1                    # one account, end to end, in a visible Chrome
node src/cli.js --count 5 --pool proxies.txt # five accounts, one exit each
node src/cli.js --verify-only                # re-prove every key already in keys.txt
```

**Ein sichtbarer (Headful-)Browser ist zwingend erforderlich** — Cloudflares Interstitial auf `/register` wird in Headless-Chrome nicht gelöst, und die Challenge schützt auch `POST /api/verification` und `POST /api/user/register`. Daher ist das Flag *aus*: `--headless` existiert nur für Experimente.

Ein Schlüssel wird **erst dann** in `keys.txt` geschrieben, **nachdem** `GET /v1/models` und eine echte Completion geantwortet haben, und jedes Konto (Mailbox, Ausgang, Quota, Schlüssel, Nachweis) wird an `accounts.json` angehängt.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste (optional — ohne eine läuft die CLI direkt) und der Kontoanzahl, merkt sich beides und führt die CLI aus. `--verify-only` beweist die bereits in `keys.txt` stehenden Schlüssel erneut.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

Jede Prüfung unten lief am **2026-10-21** über frische öffentliche Ausgänge (kein VPN im Spiel). Der Mint-Flow wurde für die ersten zehn Schlüssel vom gepinnten Driver des Labs gesteuert und für **Schlüssel #11 von der CLI dieses Pakets selbst, Ende zu Ende** (`node src/cli.js --count 1` → `done: every key minted`), und die ganze Datei wurde durch **`node src/cli.js --verify-only`** erneut bewiesen.

| Prüfung | Ergebnis |
| --- | --- |
| `/register`-Interstitial in einem **Headful**-Chrome | **gelöst** — 2–14 Klickrunden, bei jedem Ausgang, der durchkam |
| Headless-Kontrolle an diesen Ausgängen | **0/9 gelöst** zur selben Stunde — deshalb ist das Flag standardmäßig aus |
| lokalisierte Challenge | CF liefert das Interstitial in der Browsersprache aus („Bir dakika lütfen…“ bei einem `tr`-Chrome, gemessen 2026-10-21) → der Detektor prüft die **Panel-SPA-Wurzel**, nicht den Titel, und Chrome wird auf `--lang=en-US` gepinnt |
| per Mail gesendeter Code | **~15–25 s** von `support@wallabytoken.com` („Wallaby邮箱验证邮件“), 6-stelliger Code, 10 Minuten gültig |
| `POST /api/user/register?turnstile=` | **200** mit `data.access_token` (JWT); ein Token nur im Body antwortet `Turnstile token 为空` |
| Konsolen-Session | **Bearer JWT** — `/api/user/self` gibt ohne ihn 401, mit ihm 200 (`quota = 250000`) |
| Schlüssel-Route | `POST /api/token/` 200 (kein Schlüssel im Body) → die Liste gibt ihn **maskiert** zurück → `POST /api/token/<id>/key` gibt den 48-Zeichen-Klartext zurück |
| `GET /v1/models` pro Schlüssel | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| `POST /v1/chat/completions` pro Schlüssel | **200** mit `content \|\| reasoning_content` — **jeder Schlüssel verifiziert** |
| Anmeldeguthaben | `quota = 250000` = **0,50 $**, keine Karte/Telefon/Einladung |
| Rate-Limit | 30-Aufruf-Burst **28×200**, 2 Proxy-Fehler, **0×429** |
| Durchsatz | **~2–2,5 min pro Konto** bei einem guten Ausgang; ein schlechter Ausgang wird übersprungen, Worst Case ~5 min |

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Schlüssel werden nie ausgeliefert). Router-Kombos folgen derselben Regel auf Modellebene: Ein Eintrag wird
> **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Schlüssel oder ein toter Anbieter wird verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie versteckt.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Mailbox | temp.tf-Alias (`outlook`/`hotmail` Plus-Alias) | eine Adresse pro Konto; das Panel lehnt 9 890 Wegwerf-Domains ab, und diese Familie ist eine echte Microsoft-Mailbox |
| Interstitial | `/register` in einem **Headful**-Chrome | das Widget lebt in einem geschlossenen Shadow Root, also wird das DOM durchdrungen (`DOM.getDocument {pierce:true}`) und die Box mit echten Mausereignissen angeklickt; 4–10 Runden |
| Turnstile | das eigene Widget des Panels (`turnstile_sitekey` aus `/api/status`) | nativ ausgelesen, wenn die Seite es löst (773–794 Zeichen lange Tokens), andernfalls im selben Rhythmus eingebunden und angeklickt |
| Code | `GET /api/verification?email=&turnstile=` → per Mail gesendeter Code | das Token muss im **Query-String** mitfahren; nur im Body antwortet die Route `Turnstile token 为空` |
| Registrierung | `POST /api/user/register?turnstile=` | sendet einen 6-stelligen Code per Mail (in jeder Stichprobe hexadezimal, 10 Minuten gültig, zugestellt in ~15–25 s von `support@wallabytoken.com`) |
| Session | das `data.access_token`-JWT aus Register/Login | die Konsole wird mit **Bearer** authentifiziert, nicht mit Cookies: `/api/user/self` antwortet `401 invalid access token` ohne den Header |
| Schlüssel | `POST /api/token/` → `POST /api/token/<id>/key` | das Erstellen antwortet 200 **ohne** Schlüssel und die Liste gibt ihn **maskiert** zurück (`zcMh**********UCAK`); der Klartext kommt nur von der `/key`-Route |
| Nachweis | `GET /v1/models` + `POST /v1/chat/completions` | direkt aus Node — das Relay stellt `/v1/*` keine Challenge; `content || reasoning_content` zählt |

## ⚙️ CLI-Optionen

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

| Flag | Standard | Bedeutung |
| --- | --- | --- |
| `--count N` | `1` | Anzahl der zu erstellenden Konten, ein Browser nach dem anderen |
| `--pool FILE` | `proxies.txt`, falls vorhanden | ein Ausgang pro Zeile (`http://`, `socks5://`); ohne ihn läuft der Lauf direkt |
| `--proxy URL` | — | einen einzelnen Ausgang festlegen |
| `--exits K` | `8` | wie viele Kandidaten-Ausgänge ein Konto verbrauchen darf, bevor es aufgegeben wird |
| `--model ID` | `kimi-k3` | Modell, das für das Live-Gate verwendet wird |
| `--port N` | auto | Chrome-DevTools-Port |
| `--headless` | aus | nur für Experimente: Cloudflare wird nicht lösen |
| `--keep` | aus | Chrome am Ende des Laufs geöffnet lassen |
| `--code-timeout S` | `360` | wie lange auf den per Mail gesendeten Code gewartet wird |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen.** Ohne einen Pool sagt die CLI das und verbindet direkt; Anmeldung, Schlüsselerstellung und Verifizierung sind identisch, nur der Ursprung der Pakete ändert sich.

Mit einem Pool bekommt jeder Versuch **einen eigenen Browser, der an diesen Ausgang gepinnt ist** (Chrome legt seinen Proxy beim Start fest), sodass ein Ausgang, der das Interstitial nicht lösen kann, nur seinen eigenen Versuch kostet und die CLI zum nächsten Kandidaten übergeht. Die funktionierenden Ausgänge sind die, deren IP-Klasse Cloudflare bei einem sichtbaren Browser toleriert; tote Leitungen zeigen sich als `page-unhealthy-after-clear` oder eine `chrome-error`-Seite und werden übersprungen.

Authentifizierte HTTP-Proxys werden vom Browser-Teil unterstützt (407 wird im Browser beantwortet); Ausgänge mit IP-Allowlist funktionieren weiterhin. — verwende Ausgänge mit IP-Allowlist. Rotiere die Liste: Der beste Ausgang einer Stunde ist oft am nächsten Tag tot (gemessen 2026-10-21: Der zuverlässigste Ausgang des Tages antwortete innerhalb von Stunden nicht mehr).

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-bewiesener Schlüssel pro Zeile — von Git ignoriert |
| `keys-dead.txt` | von der API abgelehnte Schlüssel (`401`/`403`/`quota`) — `key<TAB>Grund<TAB>ISO` — von Git ignoriert |
| `accounts.json` | Mailbox, Ausgang, Quota, Schlüssel und das Gate-Ergebnis — pro Konto angehängt — von Git ignoriert |
| `proxies.txt` | deine Ausgänge, einer pro Zeile — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Modelle werden als `wallaby/kimi-k3` bereitgestellt.

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Modelle werden als `wallaby/kimi-k3` bereitgestellt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 Was der Anbieter gibt | ein Konto pro Schlüssel — 0,50 $ Anmeldeguthaben, kimi-k3 chat-verifiziert (ein sichtbarer Browser ist zwingend erforderlich) |
| 🔑 Was ein Schlüssel dir bringt | einen API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 2 Modell-IDs am unten stehenden Endpunkt, zu den Limits deines Tarifs. Die Quota liegt auf dem **Konto**, genau deshalb erstellt dieses Tool ein Konto pro Schlüssel |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 Deine Daten | nur wallabytoken.com und das von dir konfigurierte Inbox-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Issues

Wenn Wallaby seine Register-Form, seinen Turnstile-Sitekey, die Konsolen-Schlüsselroute oder den Katalog ändert, stoppt das Tool an diesem Schritt und sagt es. **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>