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

**Crea cuentas de Wallaby en masa con claves API — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-2-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

Wallaby (wallabytoken.com) es una capa de inferencia gestionada desde Sídney que revende modelos abiertos de frontera en USD prepago, y **cada cuenta nueva empieza con $0.50 de crédito de prueba gratis** — sin tarjeta, sin teléfono, sin recarga. Hoy el catálogo es un solo modelo, **`kimi-k3`** (contexto de 1M, razonamiento siempre activo), facturado a **$2.70 entrada / $13.50 salida por 1M de tokens** ($0.27 en caché) — un 10% por debajo del precio de lista oficial de Kimi.

El panel es un fork de New API detrás de **Cloudflare**, y Cloudflare es toda la dificultad: `/register` responde con un desafío gestionado, y `POST /api/verification` más `POST /api/user/register` también están desafiados — así que no existe ninguna clave sin un navegador que tenga `cf_clearance`. Peor aún, el desafío solo se supera con un navegador **visible**: medido en las mismas salidas a la misma hora, el modo headless superó **0/9** y el modo headful superó **3/3**. Por eso esta herramienta maneja un Chrome real y headful (el README lo repite, porque una ejecución headless se ve exactamente igual que un panel roto) y por eso una cuenta cuesta un par de minutos en lugar de un segundo.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Crédito de registro | **$0.50** — leído desde la consola como `quota = 250000` (`quota_per_unit = 500000`, USD 1:1) |
| Tarjeta / teléfono | **ninguno** — dirección de correo + contraseña + un código enviado por correo + una verificación humana |
| Caducidad | **nunca** (“sin tarjeta · sin recarga · nunca caduca”) |
| Modelos en el nivel gratuito | **`kimi-k3`** (+ alias `moonshotai/kimi-k3`); DeepSeek V4 Flash/Pro figuran como temporalmente no disponibles |
| Precio | $2.70 entrada / $13.50 salida / $0.27 en caché por 1M (lista oficial de Kimi **−10%**) |
| Límite de velocidad | **ninguno visto** — una ráfaga de 30 llamadas respondió 28×200 sin ningún 429 (las otras dos fueron fallos de proxy) |
| La unidad que escala | **una cuenta = una clave**; el crédito vive en la cuenta, así que 10 claves = 10 × $0.50 |

> 💡 El nivel gratuito lo define Wallaby y puede cambiar. Consulta los números en vivo en [wallabytoken.com](https://wallabytoken.com) — y deja que la propia verificación de la herramienta decida:

```bash
```bash

# every key in keys.txt: the model list plus one real completion
node src/cli.js --verify-only

# or by hand (keys carry no `sk-` prefix)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` es un modelo de razonamiento: un `max_tokens` pequeño se consume en `reasoning_tokens` y `content` vuelve como `null` aunque la llamada haya tenido éxito — esta herramienta cuenta `content || reasoning_content` como prueba de vida exactamente por eso.
```

## 🤖 Modelos — los 2 que hay

`GET /v1/models` con una clave activa (2026-10-21):

| ID del modelo | Nota |
| --- | --- |
| `kimi-k3` | el modelo por el que existe este proveedor — contexto de 1M, razonamiento de pesos abiertos, el pensamiento se factura como salida |
| `moonshotai/kimi-k3` | el mismo modelo bajo su id upstream |

Las respuestas nombran la pila de servicio en lugar del alias — `"model": "FW-Kimi-K3"` y `"model": "accounts/fireworks/models/kimi-k3"` — así que el backend es Fireworks. El proveedor publica una lista de precios legible por máquina en [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json).

## 🧪 Cómo usar la API

URL base **`https://api.wallabytoken.com/v1`** — compatible con OpenAI, y la propia documentación del proveedor dice que la migración son dos líneas (`base_url` y la clave).

Las claves tienen **48 caracteres sin prefijo `sk-`**; la autenticación es un token bearer en cada solicitud.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

La documentación del sitio promete que no hay techo de límite de velocidad en el nivel gratuito; la medición concuerda (30 llamadas rápidas, cero 429, latencias de 2-36 s con una cola upstream).

## 🛠 Inicio rápido

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 1                    # one account, end to end, in a visible Chrome
node src/cli.js --count 5 --pool proxies.txt # five accounts, one exit each
node src/cli.js --verify-only                # re-prove every key already in keys.txt
```

**Un navegador visible (headful) es obligatorio** — el intersticial de Cloudflare en `/register` no se supera en Chrome headless, y el desafío también protege `POST /api/verification` y `POST /api/user/register`. Por eso el flag está *desactivado*: `--headless` existe solo para experimentos.

Una clave se escribe en `keys.txt` **solo después** de que `GET /v1/models` y una finalización real hayan respondido, y cada cuenta (buzón, salida, cuota, clave, prueba) se añade a `accounts.json`.

### 🖱️ El lanzador

El lanzador pide la lista de proxies (opcional — sin ella el CLI se ejecuta directo) y el número de cuentas, recuerda ambos y ejecuta el CLI. `--verify-only` vuelve a probar las claves que ya están en `keys.txt`.

## ✅ Verificado y funcionando — cada clave se prueba

Cada comprobación a continuación se ejecutó el **2026-10-21** sobre salidas públicas nuevas (sin VPN en el proceso). El flujo de creación fue impulsado por el driver fijado del laboratorio para las primeras diez claves y por **el propio CLI de este paquete de principio a fin para la clave #11**verified**`node src/cli.js --verify-only`**.

| Comprobación | Resultado |
| --- | --- |
| Intersticial de `/register` en un Chrome **headful** | **superado** — 2–14 rondas de clics, en cada salida que lo logró |
| Control headless en esas salidas | **0/9 superados** a la misma hora — por eso el flag está desactivado por defecto |
| Desafío localizado | CF sirve el intersticial en el idioma del navegador («Bir dakika lütfen…» en un Chrome `tr`, medido el 2026-10-21) → el detector prueba la **raíz del SPA del panel**, no el título, y Chrome está fijado a `--lang=en-US` |
| Código enviado por correo | **~15–25 s** desde `support@<panel-mail>` («Wallaby邮箱验证邮件»), código de 6 caracteres, válido 10 minutos |
| `POST /api/user/register?turnstile=` | **200** con `data.access_token` (JWT); un token solo en el cuerpo responde `Turnstile token 为空` |
| Sesión de consola | **Bearer JWT** — `/api/user/self` da 401 sin él, 200 con él (`quota = 250000`) |
| Ruta de la clave | `POST /api/token/` 200 (sin clave en el cuerpo) → la lista la devuelve **enmascarada** → `POST /api/token/<id>/key` devuelve el texto plano de 48 caracteres |
| `GET /v1/models` por clave | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| `POST /v1/chat/completions` por clave | **200** con `content \|\| reasoning_content` — **11/11 claves ACTIVAS** |
| Crédito de registro | `quota = 250000` = **$0.50**, sin tarjeta/teléfono/invitación |
| Límite de velocidad | Ráfaga de 30 llamadas **28×200**, 2 fallos de proxy, **0×429** |
| Rendimiento | **~2–2.5 min por cuenta** en una buena salida; una salida mala se omite, peor caso ~5 min |

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| buzón | alias de temp.tf (`outlook`/`hotmail` con alias plus) | una dirección por cuenta; el panel rechaza 9 890 dominios desechables, y esta familia es un buzón real de Microsoft |
| intersticial | `/register` en un Chrome **headful** | el widget vive en un shadow root cerrado, así que se perfora el DOM (`DOM.getDocument {pierce:true}`) y se hace clic en la casilla con eventos de ratón reales; 4–10 rondas |
| turnstile | el propio widget del panel (`turnstile_sitekey` de `/api/status`) | se lee de forma nativa cuando la página lo resuelve (tokens de 773–794 caracteres), si no se monta y se hace clic con el mismo ritmo |
| código | `GET /api/verification?email=&turnstile=` → código enviado por correo | el token debe viajar en la **cadena de consulta**; solo en el cuerpo la ruta responde `Turnstile token 为空` |
| registro | `POST /api/user/register?turnstile=` | envía por correo un código de 6 caracteres (hex en todas las muestras, válido 10 minutos, entregado en ~15–25 s desde `support@<panel-mail>`) |
| sesión | el JWT `data.access_token` de register/login | la consola se autentica con **Bearer**, no con cookies: `/api/user/self` responde `401 invalid access token` sin la cabecera |
| clave | `POST /api/token/` → `POST /api/token/<id>/key` | la creación responde 200 **sin** clave y la lista la devuelve **enmascarada** (`zcMh**********UCAK`); el texto plano solo viene de la ruta `/key` |
| prueba | `GET /v1/models` + `POST /v1/chat/completions` | directamente desde Node — el relay no desafía `/v1/*`; `content || reasoning_content` cuenta |

## ⚙️ Opciones del CLI

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

| Flag | Predeterminado | Significado |
| --- | --- | --- |
| `--count N` | `1` | cuentas a crear, un navegador a la vez |
| `--pool FILE` | `proxies.txt` si existe | una salida por línea (`http://`, `socks5://`); sin ella la ejecución es directa |
| `--proxy URL` | — | fija una sola salida |
| `--exits K` | `8` | cuántas salidas candidatas puede quemar una cuenta antes de abandonarla |
| `--model ID` | `kimi-k3` | modelo usado para la verificación en vivo |
| `--port N` | auto | puerto de Chrome DevTools |
| `--headless` | desactivado | solo para experimentos: Cloudflare no lo superará |
| `--keep` | desactivado | deja Chrome abierto cuando termina la ejecución |
| `--code-timeout S` | `360` | cuánto esperar el código enviado por correo |

## 🛰️ Detrás de un proxy

**Opcional — recomendado a escala.** Sin un pool, el CLI lo indica y se conecta directamente; el registro, la creación de claves y la verificación son idénticos, solo cambia el origen de los paquetes.

Con un pool, cada intento obtiene **su propio navegador fijado a esa salida** (Chrome fija su proxy al iniciarse), así que una salida que no puede superar el intersticial solo cuesta su propio intento y el CLI pasa al siguiente candidato. Las salidas que funcionan son aquellas cuya clase de IP tolera Cloudflare con un navegador visible; las líneas muertas aparecen como `page-unhealthy-after-clear` o una página `chrome-error` y se omiten.

Los proxies autenticados no son compatibles con la parte del navegador — usa salidas con IP en lista blanca. Rota la lista: la mejor salida de una hora suele estar muerta a la siguiente (medido el 2026-10-21: la salida más fiable del día dejó de responder en cuestión de horas).

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave probada en vivo por línea — ignorada por git |
| `accounts.json` | buzón, salida, cuota, clave y el resultado de la verificación — añadido por cuenta — ignorado por git |
| `proxies.txt` | tus salidas, una por línea — ignorado por git |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Predeterminados: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Los modelos se sirven como `wallaby/kimi-k3`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 Qué da el proveedor | una cuenta por clave — $0.50 de crédito de registro, kimi-k3 verificado por chat (un navegador visible es obligatorio) |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 2 ids de modelo en el endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con wallabytoken.com y el backend de buzón que configures; las claves permanecen en tu máquina |

## 🐞 Problemas

Si Wallaby cambia la forma de su registro, su sitekey de Turnstile, la ruta de claves de la consola o el catálogo, la herramienta se detiene en ese paso y lo indica. **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>