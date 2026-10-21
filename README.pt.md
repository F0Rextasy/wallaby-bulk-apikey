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

**Crie contas Wallaby em massa com chaves de API — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-2-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

Wallaby (wallabytoken.com) é uma camada de inferência operada em Sydney que revende modelos abertos de ponta em USD pré-pago, e **toda nova conta começa com $0.50 de crédito de teste gratuito** — sem cartão, sem telefone, sem recarga. Hoje o catálogo é um único modelo, **`kimi-k3`** (contexto de 1M, raciocínio sempre ativo), cobrado a **$2.70 entrada / $13.50 saída por 1M de tokens** ($0.27 em cache) — 10% abaixo do preço de tabela oficial do Kimi.

O painel é um fork do New API atrás do **Cloudflare**, e o Cloudflare é toda a dificuldade: `/register` responde com um desafio gerenciado, e `POST /api/verification` mais `POST /api/user/register` também são desafiados — então nenhuma chave existe sem um navegador que possua `cf_clearance`. Pior ainda, o desafio só é liberado por um navegador **visível**: medido nas mesmas saídas na mesma hora, o headless liberou **0/9** e o headful liberou **3/3**. É por isso que esta ferramenta controla um Chrome real e headful (o README repete isso, porque uma execução headless parece exatamente um painel quebrado) e por isso uma conta custa alguns minutos em vez de um segundo.

## 🎁 Nível gratuito — quanto você recebe

| O quê | Valor |
| --- | --- |
| Crédito de cadastro | **$0.50** — lido de volta do console como `quota = 250000` (`quota_per_unit = 500000`, USD 1:1) |
| Cartão / telefone | **nenhum** — endereço de e-mail + senha + um código enviado por e-mail + uma verificação humana |
| Expiração | **nunca** (“sem cartão · sem recarga · nunca expira”) |
| Modelos no nível gratuito | **`kimi-k3`** (+ alias `moonshotai/kimi-k3`); DeepSeek V4 Flash/Pro estão listados como temporariamente indisponíveis |
| Preço | $2.70 entrada / $13.50 saída / $0.27 em cache por 1M (tabela oficial do Kimi **−10%**) |
| Limite de taxa | **nenhum visto** — uma rajada de 30 chamadas respondeu 28×200 sem nenhum 429 (as outras duas foram falhas de proxy) |
| A unidade que escala | **uma conta = uma chave**; o crédito fica na conta, então 10 chaves = 10 × $0.50 |

> 💡 O nível gratuito é definido pela Wallaby e pode mudar. Confira os números ao vivo em [wallabytoken.com](https://wallabytoken.com) — e deixe o próprio gate da ferramenta decidir:

```bash
```bash
# every key in keys.txt: the model list plus one real completion
node src/cli.js --verify-only

# or by hand (keys carry no `sk-` prefix)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer 3I7ulkrQVXR1YL…" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` é um modelo de raciocínio: um `max_tokens` pequeno é consumido por `reasoning_tokens` e `content` volta como `null` mesmo que a chamada tenha tido sucesso — esta ferramenta conta `content || reasoning_content` como prova de vida exatamente por isso.
```

## 🤖 Modelos — todos os 2

`GET /v1/models` em uma chave ativa (2026-10-21):

| ID do modelo | Observação |
| --- | --- |
| `kimi-k3` | o modelo pelo qual este provedor existe — contexto de 1M, raciocínio aberto, pensamento cobrado como saída |
| `moonshotai/kimi-k3` | o mesmo modelo sob seu id upstream |

As respostas nomeiam a pilha de serviço em vez do alias — `"model": "FW-Kimi-K3"` e `"model": "accounts/fireworks/models/kimi-k3"` — então o backend é a Fireworks. O provedor publica uma lista de preços legível por máquina em [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json).

## 🧪 Como usar a API

URL base **`https://api.wallabytoken.com/v1`** — compatível com OpenAI, e a própria documentação do provedor diz que a migração são duas linhas (`base_url` e a chave).

As chaves têm **48 caracteres sem prefixo `sk-`**; a autenticação é um bearer token em cada requisição.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

A documentação do site promete nenhum teto de limite de taxa no nível gratuito; a medição concorda (30 chamadas rápidas, zero 429s, latências de 2-36 s com uma cauda upstream).

## 🛠 Início rápido

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 1                    # one account, end to end, in a visible Chrome
node src/cli.js --count 5 --pool proxies.txt # five accounts, one exit each
node src/cli.js --verify-only                # re-prove every key already in keys.txt
```

**Um navegador visível (headful) é obrigatório** — o interstitial do Cloudflare em `/register` não é liberado no Chrome headless, e o desafio também protege `POST /api/verification` e `POST /api/user/register`. Por isso a flag está *desligada*: `--headless` existe apenas para experimentos.

Uma chave é gravada em `keys.txt` **somente depois** que `GET /v1/models` e uma conclusão real responderam, e toda conta (caixa de correio, saída, cota, chave, prova) é anexada a `accounts.json`.

### 🖱️ O launcher

O launcher pede a lista de proxies (opcional — sem uma, a CLI roda direto) e a contagem de contas, lembra de ambos e executa a CLI. `--verify-only` reprova as chaves já em `keys.txt`.

## ✅ Verificado funcionando — toda chave é testada

Toda verificação abaixo rodou em **2026-10-21** sobre saídas públicas novas (sem VPN no meio): o fluxo de criação foi conduzido pelo mesmo código que este pacote entrega (`src/cli.js`), e a tabela de chaves abaixo foi reprovada por **`node src/cli.js --verify-only`**.

| Verificação | Resultado |
| --- | --- |
| Interstitial de `/register` em um Chrome **headful** | **liberado** — 2–12 rodadas de clique em toda conta que passou |
| controle headless nessas saídas | **0/9 liberações** na mesma hora — é por isso que a flag está desligada por padrão |
| código enviado por e-mail | **~15–25 s** de `support@<panel-mail>` («Wallaby邮箱验证邮件»), código de 6 caracteres, válido por 10 minutos |
| `POST /api/user/register?turnstile=` | **200** com `data.access_token` (JWT); um token apenas no corpo responde `Turnstile token 为空` |
| sessão do console | **Bearer JWT** — `/api/user/self` dá 401 sem ele, 200 com ele (`quota = 250000`) |
| rota da chave | `POST /api/token/` 200 (sem chave no corpo) → a listagem a retorna **mascarada** → `POST /api/token/<id>/key` retorna o texto simples de 48 caracteres |
| `GET /v1/models` por chave | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| `POST /v1/chat/completions` por chave | **200** com `content \|\| reasoning_content` — **10/10 chaves ATIVAS** |
| crédito de cadastro | `quota = 250000` = **$0.50**, sem cartão/telefone/convite |
| limite de taxa | rajada de 30 chamadas **28×200**, 2 falhas de proxy, **0×429** |
| taxa de transferência | **~2–2.5 min por conta**, serial, um navegador por tentativa |

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| caixa de correio | alias temp.tf (alias plus de `outlook`/`hotmail`) | um endereço por conta; o painel rejeita 9 890 domínios descartáveis, e esta família é uma caixa de correio real da Microsoft |
| interstitial | `/register` em um Chrome **headful** | o widget vive em um shadow root fechado, então o DOM é perfurado (`DOM.getDocument {pierce:true}`) e a caixa é clicada com eventos reais de mouse; 4–10 rodadas |
| turnstile | o próprio widget do painel (`turnstile_sitekey` de `/api/status`) | lido nativamente quando a página o resolve (tokens de 773–794 caracteres), caso contrário montado e clicado no mesmo ritmo |
| código | `GET /api/verification?email=&turnstile=` → código enviado por e-mail | o token deve ir na **query string**; apenas no corpo a rota responde `Turnstile token 为空` |
| registro | `POST /api/user/register?turnstile=` | envia um código de 6 caracteres (hex em todas as amostras, válido por 10 minutos, entregue em ~15–25 s de `support@<panel-mail>`) |
| sessão | o JWT `data.access_token` do registro/login | o console é autenticado com **Bearer**, não cookies: `/api/user/self` responde `401 invalid access token` sem o cabeçalho |
| chave | `POST /api/token/` → `POST /api/token/<id>/key` | a criação responde 200 **sem** uma chave e a listagem a retorna **mascarada** (`zcMh**********UCAK`); o texto simples só vem da rota `/key` |
| prova | `GET /v1/models` + `POST /v1/chat/completions` | direto do Node — o relay não desafia `/v1/*`; `content || reasoning_content` conta |

## ⚙️ Opções da CLI

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

| Flag | Padrão | Significado |
| --- | --- | --- |
| `--count N` | `1` | contas a criar, um navegador por vez |
| `--pool FILE` | `proxies.txt` se presente | uma saída por linha (`http://`, `socks5://`); sem ela a execução é direta |
| `--proxy URL` | — | fixa uma única saída |
| `--exits K` | `8` | quantas saídas candidatas uma conta pode queimar antes de ser abandonada |
| `--model ID` | `kimi-k3` | modelo usado para o gate ao vivo |
| `--port N` | auto | porta do Chrome DevTools |
| `--headless` | desligado | apenas para experimentos: o Cloudflare não vai liberar |
| `--keep` | desligado | deixa o Chrome aberto quando a execução termina |
| `--code-timeout S` | `360` | quanto tempo esperar pelo código enviado por e-mail |

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala.** Sem um pool a CLI avisa e conecta diretamente; cadastro, criação de chave e verificação são idênticos, só a origem dos pacotes muda.

Com um pool, cada tentativa recebe **seu próprio navegador fixado naquela saída** (o Chrome fixa seu proxy na inicialização), então uma saída que não consegue liberar o interstitial custa apenas sua própria tentativa e a CLI passa para o próximo candidato. As saídas que funcionam são aquelas cuja classe de IP o Cloudflare tolera com um navegador visível; linhas mortas aparecem como `page-unhealthy-after-clear` ou uma página `chrome-error` e são puladas.

Proxies autenticados não são suportados pela perna do navegador — use saídas com IP na lista de permissões. Rotacione a lista: a melhor saída de uma hora costuma estar morta na seguinte (medido em 2026-10-21: a saída mais confiável do dia parou de responder em poucas horas).

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave comprovadamente ativa por linha — ignorado pelo git |
| `accounts.json` | caixa de correio, saída, cota, chave e o resultado do gate — anexado por conta — ignorado pelo git |
| `proxies.txt` | suas saídas, uma por linha — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Padrões: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Os modelos são servidos como `wallaby/kimi-k3`.

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 O que o provedor dá | uma conta por chave — $0.50 de crédito de cadastro, kimi-k3 verificado por chat (um navegador visível é obrigatório) |
| 🔑 O que uma chave te dá | uma chave de API limitada à sua própria conta: os 2 ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, que é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 Seus dados | apenas wallabytoken.com e o backend de caixa de correio que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se a Wallaby mudar o formato do registro, seu sitekey do Turnstile, a rota de chave do console ou o catálogo, a ferramenta para nessa etapa e avisa. **[Abra uma issue](../../issues)** com o comando e a saída exata.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>