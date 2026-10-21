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

**API 키로 Wallaby 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-2-of-them) · [🧪 API 사용법](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

Wallaby(wallabytoken.com)는 시드니에서 운영되는 추론 레이어로, 최전선 오픈 웨이트 모델을 선불 USD로 재판매하며, **모든 신규 계정은 $0.50의 무료 체험 크레딧으로 시작합니다** — 카드도, 전화번호도, 충전도 필요 없습니다. 현재 카탈로그는 단일 모델인 **`kimi-k3`**(1M 컨텍스트, 상시 추론)이며, **1M 토큰당 $2.70 입력 / $13.50 출력**($0.27 캐시)으로 청구됩니다 — 공식 Kimi 정가보다 10% 저렴합니다.

패널은 **Cloudflare** 뒤에 있는 New API 포크이며, Cloudflare가 모든 어려움의 원인입니다: `/register`는 관리형 챌린지에 응답하고, `POST /api/verification`과 `POST /api/user/register`도 챌린지를 받습니다 — 따라서 `cf_clearance`를 보유한 브라우저 없이는 키가 존재할 수 없습니다. 더 나쁜 점은, 챌린지가 **가시적** 브라우저에서만 통과된다는 것입니다: 동일한 출구에서 같은 시간대에 측정했을 때, 헤드리스는 **0/9**를 통과했고 헤드풀은 **3/3**을 통과했습니다. 이것이 이 도구가 실제의 헤드풀 Chrome을 구동하는 이유이며(헤드리스 실행은 패널이 고장 난 것처럼 보이기 때문에 README에서 반복합니다), 하나의 계정에 1초가 아닌 몇 분이 걸리는 이유입니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 가입 크레딧 | **$0.50** — 콘솔에서 `quota = 250000`으로 확인됨 (`quota_per_unit = 500000`, USD 1:1) |
| 카드 / 전화번호 | **둘 다 불필요** — 이메일 주소 + 비밀번호 + 메일로 받은 코드 + 사람 확인 |
| 만료 | **없음** ("카드 없음 · 충전 없음 · 만료 없음") |
| 무료 티어 모델 | **`kimi-k3`** (+ 별칭 `moonshotai/kimi-k3`); DeepSeek V4 Flash/Pro는 일시적으로 사용 불가로 표시됨 |
| 가격 | 1M당 $2.70 입력 / $13.50 출력 / $0.27 캐시 (공식 Kimi 정가 **−10%**) |
| 속도 제한 | **확인된 것 없음** — 30회 버스트 호출이 429 없이 28×200으로 응답 (나머지 2건은 프록시 실패) |
| 확장 단위 | **계정 하나 = 키 하나**; 크레딧은 계정에 있으므로 10개 키 = 10 × $0.50 |

> 💡 무료 티어는 Wallaby가 설정하며 변경될 수 있습니다. 실시간 수치는 [wallabytoken.com](https://wallabytoken.com)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
```bash
# keys.txt의 모든 키: 모델 목록과 실제 완성 호출 한 번
node src/cli.js --verify-only

# 또는 직접 (키에는 `sk-` 접두사가 없음)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer 3I7ulkrQVXR1YL…" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3`는 추론 모델입니다: 작은 `max_tokens`는 `reasoning_tokens`에 의해 소비되고 호출이 성공했음에도 `content`는 `null`로 돌아옵니다 — 이 도구가 바로 그 이유로 `content || reasoning_content`를 살아있음의 증거로 계산합니다.
```

## 🤖 모델 — 총 2개

활성 키에서의 `GET /v1/models` (2026-10-21):

| 모델 ID | 비고 |
| --- | --- |
| `kimi-k3` | 이 제공자가 존재하는 이유인 모델 — 1M 컨텍스트, 오픈 웨이트 추론, 사고는 출력으로 청구됨 |
| `moonshotai/kimi-k3` | 업스트림 id로 표기된 동일한 모델 |

응답은 별칭이 아닌 서빙 스택을 명시합니다 — `"model": "FW-Kimi-K3"` 및 `"model": "accounts/fireworks/models/kimi-k3"` — 따라서 백엔드는 Fireworks입니다. 제공자는 [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json)에 기계 판독 가능한 가격표를 게시합니다.

## 🧪 API 사용법

Base URL **`https://api.wallabytoken.com/v1`** — OpenAI 호환, 제공자 자체 문서에 따르면 마이그레이션은 두 줄(`base_url`과 키)입니다.

키는 **`sk-` 접두사가 없는 48자**이며, 인증은 모든 요청에 베어러 토큰입니다.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

사이트 문서는 무료 티어에 속도 제한 상한이 없다고 약속하며, 측정 결과도 이에 부합합니다 (빠른 30회 호출, 429 없음, 업스트림 꼬리로 인한 2-36초 지연).

## 🛠 빠른 시작

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # 선택 사항 — 없으면 도구는 직접 연결로 실행됨
node src/cli.js --count 1                    # 계정 하나, 처음부터 끝까지, 가시적 Chrome에서
node src/cli.js --count 5 --pool proxies.txt # 계정 다섯 개, 각각 하나의 출구
node src/cli.js --verify-only                # keys.txt에 이미 있는 모든 키를 다시 검증
```

**가시적(헤드풀) 브라우저는 필수입니다** — `/register`의 Cloudflare 인터스티셜은 헤드리스 Chrome에서 통과되지 않으며, 챌린지는 `POST /api/verification`과 `POST /api/user/register`도 보호합니다. 따라서 플래그는 *꺼져* 있습니다: `--headless`는 실험용으로만 존재합니다.

키는 `GET /v1/models`와 실제 완성 호출이 응답한 **후에만** `keys.txt`에 기록되며, 모든 계정(메일박스, 출구, 할당량, 키, 증명)은 `accounts.json`에 추가됩니다.

### 🖱️ 런처

런처는 프록시 목록(선택 사항 — 없으면 CLI는 직접 실행)과 계정 수를 묻고, 둘 다 기억한 뒤 CLI를 실행합니다. `--verify-only`는 `keys.txt`에 이미 있는 키를 다시 검증합니다.

## ✅ 검증됨 — 모든 키가 테스트됨

아래의 모든 검사는 **2026-10-21**에 새로운 공용 출구를 통해 실행되었습니다 (VPN 없음): 발급 흐름은 이 패키지가 제공하는 동일한 코드(`src/cli.js`)로 구동되었고, 아래의 키 표는 **`node src/cli.js --verify-only`**로 다시 검증되었습니다.

| 검사 | 결과 |
| --- | --- |
| **헤드풀** Chrome에서의 `/register` 인터스티셜 | **통과** — 통과한 모든 계정에서 2–12회 클릭 라운드 |
| 해당 출구에서의 헤드리스 대조군 | 같은 시간대에 **0/9 통과** — 이것이 플래그가 기본적으로 꺼져 있는 이유 |
| 메일로 받은 코드 | `support@<panel-mail>`에서 **~15–25초** («Wallaby邮箱验证邮件»), 6자리 코드, 10분간 유효 |
| `POST /api/user/register?turnstile=` | **200**과 `data.access_token` (JWT); 본문에만 토큰을 넣으면 `Turnstile token 为空` 응답 |
| 콘솔 세션 | **Bearer JWT** — 없으면 `/api/user/self`는 401, 있으면 200 (`quota = 250000`) |
| 키 경로 | `POST /api/token/` 200 (본문에 키 없음) → 목록은 **마스킹**된 키를 반환 → `POST /api/token/<id>/key`가 48자 평문을 반환 |
| 키별 `GET /v1/models` | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| 키별 `POST /v1/chat/completions` | **200**과 `content \|\| reasoning_content` — **10/10 키 LIVE** |
| 가입 크레딧 | `quota = 250000` = **$0.50**, 카드/전화번호/초대 없음 |
| 속도 제한 | 30회 버스트 **28×200**, 프록시 실패 2건, **0×429** |
| 처리량 | **계정당 ~2–2.5분**, 직렬, 시도당 브라우저 하나 |

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 메일박스 | temp.tf 별칭 (`outlook`/`hotmail` 플러스 별칭) | 계정당 주소 하나; 패널은 9,890개의 일회용 도메인을 거부하며, 이 계열은 실제 Microsoft 메일박스임 |
| 인터스티셜 | **헤드풀** Chrome에서의 `/register` | 위젯이 닫힌 섀도 루트에 있으므로 DOM을 관통하고(`DOM.getDocument {pierce:true}`) 실제 마우스 이벤트로 상자를 클릭함; 4–10 라운드 |
| turnstile | 패널 자체 위젯 (`/api/status`의 `turnstile_sitekey`) | 페이지가 해결하면 네이티브로 읽고(773–794자 토큰), 그렇지 않으면 동일한 리듬으로 마운트하고 클릭함 |
| 코드 | `GET /api/verification?email=&turnstile=` → 메일로 받은 코드 | 토큰은 **쿼리 문자열**에 실려야 함; 본문에만 있으면 라우트는 `Turnstile token 为空` 응답 |
| 등록 | `POST /api/user/register?turnstile=` | 6자리 코드를 메일로 발송 (모든 샘플에서 16진수, 10분간 유효, `support@<panel-mail>`에서 ~15–25초 내 배달) |
| 세션 | register/login의 `data.access_token` JWT | 콘솔은 쿠키가 아닌 **Bearer**로 인증됨: 헤더 없이 `/api/user/self`는 `401 invalid access token` 응답 |
| 키 | `POST /api/token/` → `POST /api/token/<id>/key` | 생성은 키 **없이** 200을 응답하고 목록은 **마스킹**된 키를 반환함 (`zcMh**********UCAK`); 평문은 `/key` 라우트에서만 나옴 |
| 증명 | `GET /v1/models` + `POST /v1/chat/completions` | Node에서 직접 — 릴레이는 `/v1/*`에 챌린지를 걸지 않음; `content || reasoning_content`가 계산됨 |

## ⚙️ CLI 옵션

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

| 플래그 | 기본값 | 의미 |
| --- | --- | --- |
| `--count N` | `1` | 발급할 계정 수, 한 번에 브라우저 하나 |
| `--pool FILE` | 존재하면 `proxies.txt` | 줄당 출구 하나 (`http://`, `socks5://`); 없으면 직접 실행 |
| `--proxy URL` | — | 단일 출구 고정 |
| `--exits K` | `8` | 계정이 포기되기 전에 소모할 수 있는 후보 출구 수 |
| `--model ID` | `kimi-k3` | 라이브 게이트에 사용되는 모델 |
| `--port N` | 자동 | Chrome DevTools 포트 |
| `--headless` | 꺼짐 | 실험용으로만: Cloudflare가 통과되지 않음 |
| `--keep` | 꺼짐 | 실행이 끝나도 Chrome을 열어 둠 |
| `--code-timeout S` | `360` | 메일로 받은 코드를 기다리는 시간 |

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장됨.** 풀이 없으면 CLI가 그렇게 알리고 직접 연결합니다; 가입, 키 발급, 검증은 동일하며 패킷의 출처만 바뀝니다.

풀이 있으면 모든 시도는 **해당 출구에 고정된 자체 브라우저**를 받습니다 (Chrome은 시작 시 프록시를 고정함), 따라서 인터스티셜을 통과하지 못하는 출구는 자기 시도만 소모하고 CLI는 다음 후보로 넘어갑니다. 작동하는 출구는 Cloudflare가 가시적 브라우저와 함께 허용하는 IP 클래스의 출구입니다; 죽은 회선은 `page-unhealthy-after-clear` 또는 `chrome-error` 페이지로 나타나며 건너뜁니다.

인증 프록시는 브라우저 구간에서 지원되지 않습니다 — IP 허용 목록에 등록된 출구를 사용하세요. 목록을 교체하세요: 한 시간의 최고 출구가 다음 시간에는 죽어 있는 경우가 많습니다 (2026-10-21 측정: 그날 가장 안정적인 출구가 몇 시간 내에 응답을 멈춤).

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 라이브 검증된 키가 한 줄에 하나 — git-ignored |
| `accounts.json` | 메일박스, 출구, 할당량, 키 및 게이트 결과 — 계정별로 추가됨 — git-ignored |
| `proxies.txt` | 출구 목록, 한 줄에 하나 — git-ignored |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

기본값: `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. 모델은 `wallaby/kimi-k3`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 제공자가 주는 것 | 키당 계정 하나 — $0.50 가입 크레딧, kimi-k3 채팅 검증됨 (가시적 브라우저 필수) |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 API 키 하나: 아래 엔드포인트의 2개 모델 id, 요금제 한도 내에서. 할당량은 **계정**에 있으므로, 이 도구가 키당 계정 하나를 생성하는 것임 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 데이터 | wallabytoken.com과 설정한 메일박스 백엔드만 접촉됨; 키는 사용자 컴퓨터에 남음 |

## 🐞 이슈

Wallaby가 등록 형태, Turnstile 사이트키, 콘솔 키 라우트 또는 카탈로그를 변경하면, 도구는 해당 단계에서 멈추고 그렇게 알립니다. 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey 기여자

</div>