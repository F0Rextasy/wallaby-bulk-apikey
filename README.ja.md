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

**APIキー付きのWallabyアカウントを一括作成 — OpenAI互換の推論 + 9Routerコネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-2-of-them) · [🧪 APIの使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

<div align="center">

[English](README.md) · [Türkçe](README.tr.md) · [中文](README.cn.md) · **日本語** · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ なぜこれが存在するのか

Wallaby (wallabytoken.com) はシドニーで運営されている推論レイヤーで、最先端のオープンウェイトモデルを前払いのUSDで再販しており、**すべての新規アカウントに$0.50の無料トライアルクレジットが付与されます** — カード不要、電話番号不要、チャージ不要。現在のカタログは単一のモデル、**`kimi-k3`**（100万トークンのコンテキスト、常時オンの推論）で、**100万トークンあたり入力$2.70 / 出力$13.50**（キャッシュ時$0.27）で課金されます — Kimiの公式定価より10%安い価格です。

パネルは**Cloudflare**の背後にあるNew APIのフォークであり、Cloudflareこそが最大の難関です：`/register`はマネージドチャレンジを返し、`POST /api/verification`と`POST /api/user/register`も同様にチャレンジされます — つまり`cf_clearance`を保持するブラウザなしではキーは存在しません。さらに悪いことに、チャレンジは**可視の**ブラウザでのみクリアされます：同じ時間帯に同じ出口で測定したところ、ヘッドレスは**0/9**、ヘッドフルは**3/3**をクリアしました。これが、このツールが実際のヘッドフルChromeを操作する理由であり（ヘッドレス実行は壊れたパネルとまったく同じに見えるため、READMEで繰り返し述べています）、1アカウントに数秒ではなく数分かかる理由です。

## 🎁 無料枠 — いくらもらえるか

| 項目 | 値 |
| --- | --- |
| 登録クレジット | **$0.50** — コンソールから`quota = 250000`として読み戻される（`quota_per_unit = 500000`、USD 1:1） |
| カード / 電話番号 | **どちらも不要** — メールアドレス + パスワード + メールで届くコード + 人間による確認 |
| 有効期限 | **なし**（「カード不要 · チャージ不要 · 期限なし」） |
| 無料枠で使えるモデル | **`kimi-k3`**（+ エイリアス`moonshotai/kimi-k3`）。DeepSeek V4 Flash/Proは一時的に利用不可として掲載 |
| 価格 | 100万トークンあたり入力$2.70 / 出力$13.50 / キャッシュ$0.27（Kimi公式定価**−10%**） |
| レート制限 | **確認されず** — 30回のバースト呼び出しで28回が200を返し、429はまったく発生しなかった（残り2回はプロキシ障害） |
| スケールする単位 | **1アカウント = 1キー**。クレジットはアカウントに紐づくため、10キー = 10 × $0.50 |

> 💡 無料枠はWallabyが設定するもので、変更される可能性があります。最新の数値は[wallabytoken.com](https://wallabytoken.com)で確認してください — そしてツール自身のゲートに判断を委ねてください：

```bash
```bash
# keys.txt内のすべてのキー：モデルリストと実際の補完1回
node src/cli.js --verify-only

# または手動で（キーに`sk-`プレフィックスはない）
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3`は推論モデルです：小さな`max_tokens`は`reasoning_tokens`に消費され、呼び出しが成功しても`content`は`null`で返ってきます — まさにその理由から、このツールは`content || reasoning_content`を生存の証拠としてカウントします。
```

## 🤖 モデル — 全部で2つ

稼働中のキーでの`GET /v1/models`（2026-10-21）：

| モデルID | 備考 |
| --- | --- |
| `kimi-k3` | このプロバイダーが存在する理由であるモデル — 100万コンテキスト、オープンウェイト推論、思考は出力として課金 |
| `moonshotai/kimi-k3` | 上流のIDで同じモデル |

レスポンスはエイリアスではなくサービングスタックを名乗ります — `"model": "FW-Kimi-K3"`および`"model": "accounts/fireworks/models/kimi-k3"` — つまりバックエンドはFireworksです。プロバイダーは機械可読な価格リストを[wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json)で公開しています。

## 🧪 APIの使い方

ベースURL **`https://api.wallabytoken.com/v1`** — OpenAI互換で、プロバイダー自身のドキュメントによれば移行は2行（`base_url`とキー）だけです。

キーは**`sk-`プレフィックスのない48文字**です。認証はすべてのリクエストでベアラートークンを使用します。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

サイトのドキュメントは無料枠にレート制限の上限がないことを約束しています。測定結果も一致しています（30回の連続呼び出し、429はゼロ、上流のテールを伴う2〜36秒のレイテンシ）。

## 🛠 クイックスタート

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # 任意 — なければツールは直接接続で実行
node src/cli.js --count 1                    # 1アカウント、エンドツーエンド、可視のChromeで
node src/cli.js --count 5 --pool proxies.txt # 5アカウント、それぞれ1つの出口
node src/cli.js --verify-only                # keys.txtに既にあるすべてのキーを再検証
```

**可視（ヘッドフル）ブラウザは必須です** — `/register`のCloudflareのインタースティシャルはヘッドレスChromeではクリアされず、チャレンジは`POST /api/verification`と`POST /api/user/register`も保護しています。したがってこのフラグは*オフ*です：`--headless`は実験用にのみ存在します。

キーは`GET /v1/models`と実際の補完が応答した**後にのみ**`keys.txt`に書き込まれ、すべてのアカウント（メールボックス、出口、クォータ、キー、証明）が`accounts.json`に追記されます。

### 🖱️ ランチャー

ランチャーはプロキシリスト（任意 — なければCLIは直接実行）とアカウント数を尋ね、両方を記憶してCLIを実行します。`--verify-only`は`keys.txt`に既にあるキーを再検証します。

## ✅ 検証済み — すべてのキーがテストされています

以下のすべてのチェックは**2026-10-21**に新鮮な公開出口（VPNは介在せず）で実行されました。ミントフローは最初の10キーについてはラボの固定ドライバーで、**キー#11についてはこのパッケージ自身のCLIでエンドツーエンド**verified**`node src/cli.js --verify-only`**で再検証されました。

| チェック | 結果 |
| --- | --- |
| **ヘッドフル**Chromeでの`/register`インタースティシャル | **クリア** — 2〜14回のクリックラウンド、通過したすべての出口で |
| それらの出口でのヘッドレス対照 | 同じ時間帯で**0/9クリア** — これがフラグがデフォルトでオフになっている理由 |
| ローカライズされたチャレンジ | CFはブラウザの言語でインタースティシャルを提供する（`tr`のChromeで«Bir dakika lütfen…»、2026-10-21に測定）→ 検出器はタイトルではなく**パネルSPAのルート**をテストし、Chromeは`--lang=en-US`に固定される |
| メールで届くコード | `support@<panel-mail>`から**約15〜25秒**（«Wallaby邮箱验证邮件»）、6文字のコード、有効期間10分 |
| `POST /api/user/register?turnstile=` | `data.access_token`（JWT）付きで**200**。ボディにのみトークンを入れると`Turnstile token 为空`と応答 |
| コンソールセッション | **Bearer JWT** — これがないと`/api/user/self`は401、あると200（`quota = 250000`） |
| キールート | `POST /api/token/` 200（ボディにキーなし）→ リストは**マスク**して返す → `POST /api/token/<id>/key`が48文字の平文を返す |
| キーごとの`GET /v1/models` | **200** — `kimi-k3`、`moonshotai/kimi-k3` |
| キーごとの`POST /v1/chat/completions` | `content \|\| reasoning_content`付きで**200** — **11/11キーが稼働中** |
| 登録クレジット | `quota = 250000` = **$0.50**、カード/電話/招待なし |
| レート制限 | 30回のバーストで**28×200**、プロキシ障害2回、**0×429** |
| スループット | 良好な出口で**1アカウントあたり約2〜2.5分**。悪い出口はスキップされ、最悪の場合約5分 |

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| メールボックス | temp.tfエイリアス（`outlook`/`hotmail`のプラスエイリアス） | 1アカウントにつき1アドレス。パネルは9,890の使い捨てドメインを拒否し、このファミリーは実際のMicrosoftメールボックス |
| インタースティシャル | **ヘッドフル**Chromeでの`/register` | ウィジェットはクローズドシャドウルート内にあるため、DOMを貫通し（`DOM.getDocument {pierce:true}`）、実際のマウスイベントでボックスをクリックする。4〜10ラウンド |
| turnstile | パネル自身のウィジェット（`/api/status`からの`turnstile_sitekey`） | ページが解決したときはネイティブに読み取り（773〜794文字のトークン）、そうでなければ同じリズムでマウントしてクリック |
| コード | `GET /api/verification?email=&turnstile=` → メールで届くコード | トークンは**クエリ文字列**に乗せる必要がある。ボディにのみ入れるとルートは`Turnstile token 为空`と応答 |
| 登録 | `POST /api/user/register?turnstile=` | 6文字のコードをメール送信（すべてのサンプルで16進数、有効期間10分、`support@<panel-mail>`から約15〜25秒で配信） |
| セッション | register/loginからの`data.access_token` JWT | コンソールはクッキーではなく**Bearer**で認証される：ヘッダーがないと`/api/user/self`は`401 invalid access token`と応答 |
| キー | `POST /api/token/` → `POST /api/token/<id>/key` | 作成はキー**なし**で200を返し、リストは**マスク**して返す（`zcMh**********UCAK`）。平文は`/key`ルートからのみ得られる |
| 証明 | `GET /v1/models` + `POST /v1/chat/completions` | Nodeから直接 — リレーは`/v1/*`をチャレンジしない。`content || reasoning_content`をカウント |

## ⚙️ CLIオプション

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

| フラグ | デフォルト | 意味 |
| --- | --- | --- |
| `--count N` | `1` | ミントするアカウント数、一度に1つのブラウザ |
| `--pool FILE` | 存在すれば`proxies.txt` | 1行につき1つの出口（`http://`、`socks5://`）。なければ実行は直接接続 |
| `--proxy URL` | — | 単一の出口を固定 |
| `--exits K` | `8` | アカウントが諦めるまでに消費できる候補出口の数 |
| `--model ID` | `kimi-k3` | ライブゲートに使用するモデル |
| `--port N` | 自動 | Chrome DevToolsポート |
| `--headless` | オフ | 実験用のみ：Cloudflareはクリアしない |
| `--keep` | オフ | 実行終了時にChromeを開いたままにする |
| `--code-timeout S` | `360` | メールで届くコードを待つ時間 |

## 🛰️ プロキシの背後で

**任意 — 規模を拡大する場合は推奨。** プールがない場合、CLIはその旨を表示して直接接続します。登録、キーのミント、検証は同一で、変わるのはパケットの発信元だけです。

プールがある場合、すべての試行は**その出口に固定された独自のブラウザ**を取得します（Chromeは起動時にプロキシを固定するため）、インタースティシャルをクリアできない出口はその試行のみを消費し、CLIは次の候補に移ります。機能する出口は、Cloudflareが可視ブラウザで許容するIPクラスのものです。死んだ回線は`page-unhealthy-after-clear`または`chrome-error`ページとして現れ、スキップされます。

認証付きプロキシはブラウザ側ではサポートされていません — IP許可リストに登録された出口を使用してください。リストはローテーションしてください：ある時間帯の最良の出口は翌時間帯には死んでいることがよくあります（2026-10-21に測定：その日最も信頼できた出口が数時間以内に応答しなくなった）。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1行につき1つのライブ検証済みキー — git無視 |
| `accounts.json` | メールボックス、出口、クォータ、キー、ゲート結果 — アカウントごとに追記 — git無視 |
| `proxies.txt` | あなたの出口、1行に1つ — git無視 |

## 🔌 9Routerに接続

[9Router](https://9router.com)はセルフホスト型のOpenAI互換ルーターです：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

デフォルト：`--prefix wallaby`、`--base-url https://api.wallabytoken.com/v1`、`--model kimi-k3`。モデルは`wallaby/kimi-k3`として提供されます。

## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 プロバイダーが提供するもの | 1キーにつき1アカウント — $0.50の登録クレジット、kimi-k3チャット検証済み（可視ブラウザが必須） |
| 🔑 1つのキーで得られるもの | 自身のアカウントにスコープされた1つのAPIキー：以下のエンドポイントにある2つのモデルIDを、あなたのプランの制限で利用可能。クォータは**アカウント**に紐づくため、このツールが1キーにつき1アカウントを作成するのはまさにそのため |
| 🌐 APIの形式 | OpenAI互換：`POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのはwallabytoken.comと、あなたが設定したインボックスバックエンドのみ。キーはあなたのマシンに留まります |
## 🐞 問題報告

Wallabyが登録の形式、Turnstileのsitekey、コンソールのキールート、またはカタログを変更した場合、ツールはそのステップで停止し、その旨を報告します。コマンドと正確な出力を添えて**[issueを開いてください](../../issues)**。
## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE)を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>