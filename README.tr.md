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

**API anahtarlarıyla toplu Wallaby hesabı oluşturun — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-2-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

Wallaby (wallabytoken.com), Sidney'de işletilen ve ön ödemeli USD karşılığında öncü açık ağırlıklı modelleri yeniden satan bir çıkarım katmanıdır ve **her yeni hesap $0.50 ücretsiz deneme kredisiyle başlar** — kart yok, telefon yok, bakiye yükleme yok. Bugün katalog tek bir modelden oluşuyor: **`kimi-k3`** (1M bağlam, sürekli açık akıl yürütme), **1M token başına $2.70 giriş / $13.50 çıkış** ($0.27 önbelleklenmiş) olarak faturalandırılıyor — resmi Kimi liste fiyatının %10 altında.

Panel, **Cloudflare** arkasında bir New API çatalıdır ve Cloudflare tüm zorluğun kendisidir: `/register` yönetilen bir doğrulama sorusu döndürür ve `POST /api/verification` ile `POST /api/user/register` de sorgulanır — yani `cf_clearance` tutan bir tarayıcı olmadan hiçbir anahtar var olamaz. Daha kötüsü, doğrulama sorusu yalnızca **görünür** bir tarayıcıyla temizlenir: aynı saatte aynı çıkışlarda ölçüldüğünde, headless **0/9** temizledi ve headful **3/3** temizledi. Bu yüzden bu araç gerçek, headful bir Chrome'u çalıştırır (README bunu tekrarlıyor, çünkü headless bir çalıştırma tam olarak bozuk bir panel gibi görünür) ve bu yüzden bir hesap bir saniye yerine birkaç dakika sürer.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

| Ne | Değer |
| --- | --- |
| Kayıt kredisi | **$0.50** — konsoldan `quota = 250000` olarak okunur (`quota_per_unit = 500000`, USD 1:1) |
| Kart / telefon | **hiçbiri** — e-posta adresi + parola + e-postayla gelen kod + insan doğrulaması |
| Son kullanma | **asla** ("kart yok · bakiye yükleme yok · asla sona ermez") |
| Ücretsiz katmandaki modeller | **`kimi-k3`** (+ takma ad `moonshotai/kimi-k3`); DeepSeek V4 Flash/Pro geçici olarak kullanılamaz olarak listeleniyor |
| Fiyat | 1M başına $2.70 giriş / $13.50 çıkış / $0.27 önbelleklenmiş (resmi Kimi listesi **−%10**) |
| Hız sınırı | **hiç görülmedi** — 30 çağrılık bir patlama 28×200 yanıtladı, hiç 429 yok (diğer ikisi proxy hatasıydı) |
| Ölçeklenen birim | **bir hesap = bir anahtar**; kredi hesapta yaşar, yani anahtarlar = 10 × $0.50 |

> 💡 Ücretsiz katman Wallaby tarafından belirlenir ve değişebilir. Güncel sayıları [wallabytoken.com](https://wallabytoken.com) adresinden kontrol edin — ve aracın kendi kapısının karar vermesine izin verin:

```bash
```bash

# keys.txt içindeki her anahtar: model listesi artı bir gerçek tamamlama
node src/cli.js --verify-only

# veya elle (anahtarlarda `sk-` öneki yok)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer 3I7ulkrQVXR1YL…" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` bir akıl yürütme modelidir: küçük bir `max_tokens` `reasoning_tokens` tarafından tüketilir ve çağrı başarılı olsa bile `content` `null` döner — bu araç tam da bu nedenle `content || reasoning_content`'i yaşam kanıtı olarak sayar.
```

## 🤖 Modeller — ikisi de

Canlı bir anahtarda `GET /v1/models` (2026-10-21):

| Model Kimliği | Not |
| --- | --- |
| `kimi-k3` | bu sağlayıcının var olma sebebi olan model — 1M bağlam, açık ağırlıklı akıl yürütme, düşünme çıkış olarak faturalandırılır |
| `moonshotai/kimi-k3` | aynı model, yukarı akış kimliği altında |

Yanıtlar takma adı değil, hizmet veren yığını adlandırır — `"model": "FW-Kimi-K3"` ve `"model": "accounts/fireworks/models/kimi-k3"` — yani arka uç Fireworks. Sağlayıcı, [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json) adresinde makine tarafından okunabilir bir fiyat listesi yayınlar.

## 🧪 API nasıl kullanılır

Temel URL **`https://api.wallabytoken.com/v1`** — OpenAI uyumlu ve sağlayıcının kendi belgeleri geçişin iki satır olduğunu söylüyor (`base_url` ve anahtar).

Anahtarlar **48 karakterdir ve `sk-` öneki yoktur**; kimlik doğrulama her istekte bir bearer token'dır.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="<your key>")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

Sitenin belgeleri ücretsiz katmanda hız sınırı tavanı olmadığını vaat ediyor; ölçüm de aynı fikirde (30 hızlı çağrı, sıfır 429, yukarı akış kuyruğuyla 2-36 s gecikmeler).

## 🛠 Hızlı başlangıç

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # isteğe bağlı — olmadan araç doğrudan çalışır
node src/cli.js --count 1                    # bir hesap, baştan sona, görünür bir Chrome'da
node src/cli.js --count 5 --pool proxies.txt # beş hesap, her biri bir çıkış
node src/cli.js --verify-only                # keys.txt içinde zaten olan her anahtarı yeniden kanıtla
```

**Görünür (headful) bir tarayıcı zorunludur** — Cloudflare'in `/register` üzerindeki ara sayfası headless Chrome'da temizlenmez ve doğrulama sorusu ayrıca `POST /api/verification` ile `POST /api/user/register`'ı da korur. Bu yüzden bayrak *kapalı*dır: `--headless` yalnızca deneyler için vardır.

Bir anahtar `keys.txt` dosyasına **yalnızca** `GET /v1/models` ve gerçek bir tamamlama yanıt verdikten **sonra** yazılır ve her hesap (posta kutusu, çıkış, kota, anahtar, kanıt) `accounts.json` dosyasına eklenir.

### 🖱️ Başlatıcı

Başlatıcı, proxy listesini (isteğe bağlı — olmadan CLI doğrudan çalışır) ve hesap sayısını sorar, ikisini de hatırlar ve CLI'yi çalıştırır. `--verify-only`, `keys.txt` içinde zaten olan anahtarları yeniden kanıtlar.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

Aşağıdaki her kontrol **2026-10-21** tarihinde taze genel çıkışlar üzerinden çalıştırıldı (döngüde VPN yok). Üretim akışı ilk on anahtar için laboratuvarın sabitlenmiş sürücüsüyle ve **11 numaralı anahtar için bu paketin kendi CLI'siyle baştan sona** (`node src/cli.js --count 1` → `done: every key minted`) yürütüldü ve tüm dosya **`node src/cli.js --verify-only`** ile yeniden kanıtlandı.

| Kontrol | Sonuç |
| --- | --- |
| **Headful** Chrome'da `/register` ara sayfası | **temizlendi** — 2–14 tıklama turu, geçen her çıkışta |
| Bu çıkışlarda headless kontrolü | aynı saatte **0/9 temizleme** — bu yüzden bayrak varsayılan olarak kapalı |
| Yerelleştirilmiş doğrulama sorusu | CF ara sayfayı tarayıcının dilinde sunar (bir `tr` Chrome'da «Bir dakika lütfen…», 2026-10-21'de ölçüldü) → algılayıcı başlığı değil **panel SPA kökünü** test eder ve Chrome `--lang=en-US` olarak sabitlenir |
| E-postayla gelen kod | `support@wallabytoken.com` adresinden **~15–25 s** («Wallaby邮箱验证邮件»), 6 karakterli kod, 10 dakika geçerli |
| `POST /api/user/register?turnstile=` | `data.access_token` (JWT) ile **200**; yalnızca gövdedeki bir token `Turnstile token 为空` yanıtlar |
| Konsol oturumu | **Bearer JWT** — `/api/user/self` onsuz 401, onunla 200 (`quota = 250000`) |
| Anahtar rotası | `POST /api/token/` 200 (gövdede anahtar yok) → liste onu **maskelenmiş** döndürür → `POST /api/token/<id>/key` 48 karakterli düz metni döndürür |
| Anahtar başına `GET /v1/models` | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| Anahtar başına `POST /v1/chat/completions` | `content \|\| reasoning_content` ile **200** — **her anahtar doğrulandı** |
| Kayıt kredisi | `quota = 250000` = **$0.50**, kart/telefon/davet yok |
| Hız sınırı | 30 çağrılık patlama **28×200**, 2 proxy hatası, **0×429** |
| Verim | iyi bir çıkışta **hesap başına ~2–2.5 dk**; kötü bir çıkış atlanır, en kötü durumda ~5 dk |

> **Kalite kapıları.** Buradaki her anahtar `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> hatalar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
gelen kutusu (hesap başına bir adres)                            hesap başına taze bir adres
   │
   ├─▶ kayıt: Wallaby sayfası → e-posta adresi → gelen kutusundan kod / bağlantı
   ├─▶ oturum: hesabın çerezleri veya erişim token'ı elde
   ├─▶ anahtar üretimi: hesabın anahtar uç noktası → düz metin anahtar bir kez döndürülür (hemen diske yazılır)
   └─▶ canlı kanıt: POST https://api.wallabytoken.com/v1/chat/completions → gerçek içerik = anahtar canlı
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| posta kutusu | temp.tf takma adı (`outlook`/`hotmail` artı-takma adı) | hesap başına bir adres; panel 9 890 tek kullanımlık alan adını reddeder ve bu aile gerçek bir Microsoft posta kutusudur |
| ara sayfa | **headful** Chrome'da `/register` | widget kapalı bir shadow root içinde yaşar, bu yüzden DOM delinir (`DOM.getDocument {pierce:true}`) ve kutu gerçek fare olaylarıyla tıklanır; 4–10 tur |
| turnstile | panelin kendi widget'ı (`/api/status`'ten `turnstile_sitekey`) | sayfa çözdüğünde yerel olarak okunur (773–794 karakter token'lar), aksi halde aynı ritimde bağlanır ve tıklanır |
| kod | `GET /api/verification?email=&turnstile=` → e-postayla gelen kod | token **sorgu dizesinde** taşınmalıdır; yalnızca gövdede olduğunda rota `Turnstile token 为空` yanıtlar |
| kayıt | `POST /api/user/register?turnstile=` | 6 karakterli bir kod e-postalar (her örnekte hex, 10 dakika geçerli, `support@wallabytoken.com` adresinden ~15–25 s içinde teslim edilir) |
| oturum | kayıt/girişten gelen `data.access_token` JWT | konsol **Bearer** ile kimlik doğrular, çerezlerle değil: `/api/user/self` başlık olmadan `401 invalid access token` yanıtlar |
| anahtar | `POST /api/token/` → `POST /api/token/<id>/key` | oluşturma **anahtar olmadan** 200 yanıtlar ve liste onu **maskelenmiş** döndürür (`zcMh**********UCAK`); düz metin yalnızca `/key` rotasından gelir |
| kanıt | `GET /v1/models` + `POST /v1/chat/completions` | doğrudan Node'dan — aktarıcı `/v1/*`'ı sorgulamaz; `content || reasoning_content` sayılır |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count N        # üretilecek hesaplar (seri)
node src/cli.js --pool proxies.txt
node src/cli.js --proxy socks5://host:port
node src/cli.js --exits K        # hesap başına denenen çıkış adayları
node src/cli.js --model kimi-k3
node src/cli.js --verify-only
node src/cli.js --headless       # ÖNERİLMEZ — yukarıya bakın
node src/cli.js --help
```

| Bayrak | Varsayılan | Anlam |
| --- | --- | --- |
| `--count N` | `1` | üretilecek hesaplar, her seferinde bir tarayıcı |
| `--pool FILE` | varsa `proxies.txt` | satır başına bir çıkış (`http://`, `socks5://`); olmadan çalıştırma doğrudandır |
| `--proxy URL` | — | tek bir çıkışı sabitle |
| `--exits K` | `8` | bir hesabın vazgeçilmeden önce tüketebileceği aday çıkış sayısı |
| `--model ID` | `kimi-k3` | canlı kapı için kullanılan model |
| `--port N` | otomatik | Chrome DevTools bağlantı noktası |
| `--headless` | kapalı | yalnızca deneyler için: Cloudflare temizlemez |
| `--keep` | kapalı | çalıştırma bittiğinde Chrome'u açık bırak |
| `--code-timeout S` | `360` | e-postayla gelen kodu ne kadar bekleyeceği |

## 🛰️ Proxy arkasında

**İsteğe bağlı — ölçekte önerilir.** Havuz olmadan CLI bunu söyler ve doğrudan bağlanır; kayıt, anahtar üretimi ve doğrulama aynıdır, yalnızca paketlerin kaynağı değişir.

Bir havuzla, her deneme **o çıkışa sabitlenmiş kendi tarayıcısını** alır (Chrome proxy'sini başlangıçta sabitler), böylece ara sayfayı temizleyemeyen bir çıkış yalnızca kendi denemesine mal olur ve CLI bir sonraki adaya geçer. İşe yarayan çıkışlar, IP sınıfına Cloudflare'in görünür bir tarayıcıyla tolere ettiği çıkışlardır; ölü hatlar `page-unhealthy-after-clear` veya bir `chrome-error` sayfası olarak görünür ve atlanır.

Kimlik doğrulamalı proxy'ler tarayıcı ayağı tarafından desteklenmez — IP izin listesine alınmış çıkışlar kullanın. Listeyi döndürün: bir saatin en iyi çıkışı genellikle ertesi gün ölür (2026-10-21'de ölçüldü: günün en güvenilir çıkışı saatler içinde yanıt vermeyi bıraktı).

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına canlı kanıtlanmış bir anahtar — git tarafından yok sayılır |
| `keys-dead.txt` | API'nin reddettiği anahtarlar (`401`/`403`/`quota`) — `anahtar<TAB>sebep<TAB>ISO` — git tarafından yok sayılır |
| `accounts.json` | posta kutusu, çıkış, kota, anahtar ve kapı sonucu — hesap başına eklenir — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız, satır başına bir tane — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Varsayılanlar: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Modeller `wallaby/kimi-k3` olarak sunulur.

## 🔌 OmniRoute'a bağlan

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Varsayılanlar: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Modeller `wallaby/kimi-k3` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 Sağlayıcının verdikleri | anahtar başına bir hesap — $0.50 kayıt kredisi, kimi-k3 sohbet doğrulamalı (görünür bir tarayıcı zorunludur) |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktada 2 model kimliği, planınızın sınırlarında. Kota **hesapta** yaşar, bu aracın anahtar başına bir hesap oluşturmasının nedeni tam da budur |
| 🌐 API şekli | OpenAI uyumlu: `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca wallabytoken.com ve yapılandırdığınız gelen kutusu arka ucuyla iletişim kurulur; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Wallaby kayıt şeklini, Turnstile sitekey'ini, konsol anahtar rotasını veya kataloğu değiştirirse, araç o adımda durur ve bunu söyler. Komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey katkıda bulunanlar

</div>