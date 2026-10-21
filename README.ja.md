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

**Wallaby アカウントを API キー付きで一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-2-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

Wallaby (wallabytoken.com) はシドニーで運営されている推論レイヤーで、最先端のオープンウェイトモデルを前払い USD で再販しており、**すべての新規アカウントは $0.50 の無料トライアルクレジットで始まります** — カード不要、電話番号不要、チャージ不要。現在のカタログは単一モデル **`kimi-k3`**（100万コンテキスト、常時推論）で、**$2.70 in / $13.50 out per 1M tokens**（キャッシュ時 $0.27）で課金されます — これは Kimi の公式定価より 10% 安い価格です。

パネルは **Cloudflare** の背後にある New API のフォークであり、Cloudflare が難しさのすべてです。`/register` はマネージドチャレンジを返し、`POST /api/verification` と `POST /api/user/register` も同様にチャレンジされます — つまり `cf_clearance` を保持するブラウザなしではキーは存在しません。さらに悪いことに、チャレンジをクリアできるのは**可視**ブラウザだけです。同じ時間帯に同じ出口で計測したところ、ヘッドレスは **0/9** しかクリアできず、ヘッドフルは **3/3** クリアしました。だからこそこのツールは実際のヘッドフル Chrome を操作するのです（README で繰り返し述べているのは、ヘッドレス実行が壊れたパネルと全く同じに見えるからです）。そして 1 アカウントに数秒ではなく数分かかる理由でもあります。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| 登録クレジット | **$0.50** — コンソールから `quota = 250000` として読み戻される（`quota_per_unit = 500000`、USD 1:1） |
| カード / 電話 | **どちらも不要** — メールアドレス + パスワード + メールで届くコード + 人間確認 |
| 有効期限 | **なし**（「カード不要 · チャージ不要 · 期限なし」） |
| 無料枠で使えるモデル | **`kimi-k3`**（+ エイリアス `moonshotai/kimi-k3`）。DeepSeek V4 Flash/Pro は一時的に利用不可として掲載 |
| 価格 | $2.70 in / $13.50 out / $0.27 cached per 1M（Kimi 公式定価 **−10%**） |
| レート制限 | **確認されず** — 30 回の連続呼び出しで 28×200 が返り、429 は一切なし（残り 2 件はプロキシ障害） |
| スケールする単位 | **1 アカウント = 1 キー**。クレジットはアカウントに紐づくため、10 キー = 10 × $0.50 |

> 💡 無料枠は Wallaby が設定するもので、変更される可能性があります。最新の数値は [wallabytoken.com](https://wallabytoken.com) で確認してください — そしてツール自身のゲートに判断させましょう：

```bash
```bash
# keys.txt のすべてのキー: モデル一覧と実際の補完 1 回
node src/cli.js --verify-only

# または手動で（キーに `sk-` プレフィックスはありません）
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer 3I7ulkrQVXR1YL…" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` は推論モデルです。小さな `max_tokens` は `reasoning_tokens` に消費され、呼び出しが成功しても `content` は `null` で返ります — まさにその理由から、このツールは `content || reasoning_content` を生存の証拠としてカウントします。
```

## 🤖 モデル — 全部で 2 つ

稼働中のキーに対する `GET /v1/models`（2026-10-21）：

| モデル ID | 備考 |
| --- | --- |
| `kimi-k3` | このプロバイダーが存在する理由であるモデル — 100万コンテキスト、オープンウェイト推論、思考は出力として課金 |
| `moonshotai/kimi-k3` | 上流 ID での同じモデル |

レスポンスはエイリアスではなく提供スタックを名乗ります — `"model": "FW-Kimi-K3"` と `"model": "accounts/fireworks/models/kimi-k3"` — つまりバックエンドは Fireworks です。プロバイダーは機械可読な価格表を [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json) で公開しています。

## 🧪 API の使い方

ベース URL **`https://api.wallabytoken.com/v1`** — OpenAI 互換で、プロバイダー自身のドキュメントによれば移行は 2 行（`base_url` とキー）だけです。

キーは **48 文字で `sk-` プレフィックスはありません**。認証はすべてのリクエストでベアラートークンです。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

サイトのドキュメントは無料枠にレート制限の上限がないことを約束しており、計測結果も一致しています（30 回の高速呼び出し、429 はゼロ、上流のテールを伴う 2〜36 秒のレイテンシ）。

## 🛠 クイックスタート

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # 任意 — なければツールは直接接続で動作
node src/cli.js --count 1                    # 1 アカウント、最初から最後まで、可視 Chrome で
node src/cli.js --count 5 --pool proxies.txt # 5 アカウント、それぞれ 1 出口
node src/cli.js --verify-only                # keys.txt にあるすべてのキーを再検証
```

**可視（ヘッドフル）ブラウザは必須です** — `/register` の Cloudflare インタースティシャルはヘッドレス Chrome ではクリアされず、チャレンジは `POST /api/verification` と `POST /api/user/register` も保護しています。したがってこのフラグは*オフ*です：`--headless` は実験用にのみ存在します。

キーは `GET /v1/models` と実際の補完が応答した**後にのみ** `keys.txt` に書き込まれ、すべてのアカウント（メールボックス、出口、クォータ、キー、証明）が `accounts.json` に追記されます。

### 🖱️ ランチャー

ランチャーはプロキシリスト（任意 — なければ CLI は直接接続で動作）とアカウント数を尋ね、両方を記憶して CLI を実行します。`--verify-only` は `keys.txt` にあるキーを再検証します。

## ✅ 検証済み — すべてのキーがテストされています

以下のすべてのチェックは **2026-10-21** に新鮮なパブリック出口（VPN は使用せず）で実行されました：作成フローはこのパッケージが同梱する同じコード（`src/cli.js`）で駆動され、以下のキー表は **`node src/cli.js --verify-only`** によって再検証されました。

| チェック | 結果 |
| --- | --- |
| **ヘッドフル** Chrome での `/register` インタースティシャル | **クリア** — 通過したすべてのアカウントで 2〜12 回のクリックラウンド |
| それらの出口でのヘッドレス対照 | 同じ時間帯で **0/9 クリア** — これがフラグがデフォルトでオフである理由 |
| メールで届くコード | `support@<panel-mail>` から **約 15〜25 秒**（「Wallaby邮箱验证邮件」）、6 文字のコード、有効期間 10 分 |
| `POST /api/user/register?turnstile=` | **200** で `data.access_token`（JWT）を返す。ボディにトークンだけを入れると `Turnstile token 为空` が返る |
| コンソールセッション | **Bearer JWT** — なしでは `/api/user/self` は 401、ありでは 200（`quota = 250000`） |
| キールート | `POST /api/token/` 200（ボディにキーなし）→ 一覧は**マスク**して返す → `POST /api/token/<id>/key` が 48 文字の平文を返す |
| キーごとの `GET /v1/models` | **200** — `kimi-k3`、`moonshotai/kimi-k3` |
| キーごとの `POST /v1/chat/completions` | **200** で `content \|\| reasoning_content` — **10/10 キーが LIVE** |
| 登録クレジット | `quota = 250000` = **$0.50**、カード/電話/招待なし |
| レート制限 | 30 回連続呼び出しで **28×200**、プロキシ障害 2 件、**0×429** |
| スループット | **1 アカウントあたり約 2〜2.5 分**、直列、試行ごとに 1 ブラウザ |

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
| メールボックス | temp.tf エイリアス（`outlook`/`hotmail` プラスエイリアス） | 1 アカウントにつき 1 アドレス。パネルは 9,890 の使い捨てドメインを拒否しますが、このファミリーは本物の Microsoft メールボックスです |
| インタースティシャル | **ヘッドフル** Chrome での `/register` | ウィジェットは閉じたシャドウルート内にあるため、DOM を貫通し（`DOM.getDocument {pierce:true}`）、実際のマウスイベントでボックスをクリックします。4〜10 ラウンド |
| turnstile | パネル自身のウィジェット（`/api/status` の `turnstile_sitekey`） | ページが解決したときはネイティブに読み取り（773〜794 文字のトークン）、そうでなければ同じリズムでマウントしてクリック |
| コード | `GET /api/verification?email=&turnstile=` → メールで届くコード | トークンは**クエリ文字列**に乗せる必要があります。ボディにだけ入れるとルートは `Turnstile token 为空` を返します |
| 登録 | `POST /api/user/register?turnstile=` | 6 文字のコードをメール送信（すべてのサンプルで 16 進数、有効期間 10 分、`support@<panel-mail>` から約 15〜25 秒で配信） |
| セッション | register/login からの `data.access_token` JWT | コンソールは**Bearer**で認証され、Cookie ではありません：ヘッダーなしでは `/api/user/self` は `401 invalid access token` を返します |
| キー | `POST /api/token/` → `POST /api/token/<id>/key` | 作成はキー**なし**で 200 を返し、一覧は**マスク**して返します（`zcMh**********UCAK`）。平文は `/key` ルートからのみ得られます |
| 証明 | `GET /v1/models` + `POST /v1/chat/completions` | Node から直接 — リレーは `/v1/*` をチャレンジしません。`content || reasoning_content` をカウントします |

## ⚙️ CLI オプション

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
| `--count N` | `1` | 作成するアカウント数、一度に 1 ブラウザ |
| `--pool FILE` | 存在すれば `proxies.txt` | 1 行につき 1 出口（`http://`、`socks5://`）。なければ実行は直接接続 |
| `--proxy URL` | — | 単一の出口を固定 |
| `--exits K` | `8` | アカウントが諦めるまでに消費できる候補出口の数 |
| `--model ID` | `kimi-k3` | ライブゲートに使用するモデル |
| `--port N` | 自動 | Chrome DevTools ポート |
| `--headless` | オフ | 実験用のみ：Cloudflare はクリアしません |
| `--keep` | オフ | 実行終了時に Chrome を開いたままにする |
| `--code-timeout S` | `360` | メールで届くコードを待つ時間 |

## 🛰️ プロキシの背後で

**任意 — 規模を拡大する場合は推奨。** プールがなければ CLI はその旨を表示して直接接続します。サインアップ、キー作成、検証は同一で、変わるのはパケットの発信元だけです。

プールがある場合、すべての試行は**その出口に固定された専用のブラウザ**を取得します（Chrome は起動時にプロキシを固定します）。そのためインタースティシャルをクリアできない出口はその試行だけを無駄にし、CLI は次の候補に移ります。機能する出口は、可視ブラウザで Cloudflare が許容する IP クラスのものです。死んだ回線は `page-unhealthy-after-clear` や `chrome-error` ページとして現れ、スキップされます。

認証付きプロキシはブラウザ側ではサポートされていません — IP 許可リスト方式の出口を使用してください。リストはローテーションしてください：ある時間帯の最良の出口は翌時間帯には死んでいることがよくあります（2026-10-21 の計測：その日最も信頼できた出口が数時間以内に応答しなくなりました）。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つのライブ検証済みキー — git 管理外 |
| `accounts.json` | メールボックス、出口、クォータ、キー、ゲート結果 — アカウントごとに追記 — git 管理外 |
| `proxies.txt` | あなたの出口、1 行に 1 つ — git 管理外 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

デフォルト：`--prefix wallaby`、`--base-url https://api.wallabytoken.com/v1`、`--model kimi-k3`。モデルは `wallaby/kimi-k3` として提供されます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 プロバイダーが提供するもの | 1 キーにつき 1 アカウント — $0.50 の登録クレジット、kimi-k3 チャット検証済み（可視ブラウザが必須） |
| 🔑 1 つのキーで得られるもの | 自身のアカウントにスコープされた 1 つの API キー：以下のエンドポイントの 2 つのモデル ID を、あなたのプランの制限で利用可能。クォータは**アカウント**に紐づくため、このツールが 1 キーにつき 1 アカウントを作成するのです |
| 🌐 API の形式 | OpenAI 互換：`POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 あなたのデータ | 接続されるのは wallabytoken.com と、あなたが設定したメールボックスバックエンドのみです。キーはあなたのマシンに留まります |

## 🐞 問題報告

Wallaby が登録の形式、Turnstile サイトキー、コンソールのキールート、またはカタログを変更した場合、ツールはそのステップで停止し、その旨を報告します。コマンドと正確な出力を添えて **[issue を作成してください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>