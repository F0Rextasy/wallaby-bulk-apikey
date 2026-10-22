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

**批量创建带 API 密钥的 Wallaby 账户 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-2-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

Wallaby（wallabytoken.com）是一家位于悉尼的推理服务层，以预付美元转售前沿开放权重模型，并且**每个新账户都会获得 $0.50 的免费试用额度**——无需银行卡、无需手机号、无需充值。目前其目录中只有一个模型，**`kimi-k3`**（100 万上下文，始终开启推理），计费为**每 100 万 token $2.70 输入 / $13.50 输出**（缓存 $0.27）——比 Kimi 官方标价低 10%。

其面板是位于 **Cloudflare** 之后的 New API 分支，而 Cloudflare 正是全部的难点所在：`/register` 会返回一个托管质询，而 `POST /api/verification` 和 `POST /api/user/register` 同样受到质询——因此，没有持有 `cf_clearance` 的浏览器，就无法获得任何密钥。更糟的是，该质询只能由**可见**的浏览器通过：在同一出口、同一时段测量，无头模式通过 **0/9**，有头模式通过 **3/3**。这就是为什么本工具会驱动一个真实的、有头模式的 Chrome（README 反复强调这一点，因为无头运行看起来和面板损坏一模一样），也是为什么创建一个账户需要几分钟而不是一秒钟。

## 🎁 免费额度 — 你能获得多少

| 项目 | 值 |
| --- | --- |
| 注册额度 | **$0.50** — 从控制台读回为 `quota = 250000`（`quota_per_unit = 500000`，美元 1:1） |
| 银行卡 / 手机号 | **都不需要** — 电子邮件地址 + 密码 + 一封邮件验证码 + 一次人工验证 |
| 有效期 | **永不过期**（“无银行卡 · 无充值 · 永不过期”） |
| 免费额度可用模型 | **`kimi-k3`**（+ 别名 `moonshotai/kimi-k3`）；DeepSeek V4 Flash/Pro 列为暂时不可用 |
| 价格 | 每 100 万 $2.70 输入 / $13.50 输出 / $0.27 缓存（Kimi 官方标价 **−10%**） |
| 速率限制 | **未见任何限制** — 一次 30 次调用的突发请求返回了 28 次 200，完全没有 429（另外两次是代理失败） |
| 可扩展的单元 | **一个账户 = 一个密钥**；额度属于账户，因此 10 个密钥 = 10 × $0.50 |

> 💡 免费额度由 Wallaby 设定，可能会变化。请在 [wallabytoken.com](https://wallabytoken.com) 查看实时数字——并让工具自身的关卡来判定：

```bash
```bash

# keys.txt 中的每个密钥：模型列表加上一次真实补全
node src/cli.js --verify-only

# 或者手动执行（密钥不带 `sk-` 前缀）
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` 是一个推理模型：较小的 `max_tokens` 会被 `reasoning_tokens` 消耗掉，即使调用成功，`content` 也会返回 `null`——正因如此，本工具将 `content || reasoning_content` 计为存活证明。
```

## 🤖 模型 — 全部 2 个

在有效密钥上执行 `GET /v1/models`（2026-10-21）：

| 模型 ID | 备注 |
| --- | --- |
| `kimi-k3` | 该提供商存在的理由——100 万上下文，开放权重推理，思考按输出计费 |
| `moonshotai/kimi-k3` | 同一模型的上游 id |

响应中给出的是服务栈而非别名——`"model": "FW-Kimi-K3"` 和 `"model": "accounts/fireworks/models/kimi-k3"`——因此后端是 Fireworks。该提供商在 [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json) 发布了机器可读的价格表。

## 🧪 如何使用 API

基础 URL **`https://api.wallabytoken.com/v1`**——兼容 OpenAI，且提供商自己的文档称迁移只需两行（`base_url` 和密钥）。

密钥为 **48 个字符，不带 `sk-` 前缀**；认证方式为每个请求携带 bearer token。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

该网站的文档承诺免费额度没有速率上限；测量结果与之相符（30 次快速调用，零 429，延迟 2-36 秒，带有上游长尾）。

## 🛠 快速开始

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # 可选 — 没有它工具将直连运行
node src/cli.js --count 1                    # 一个账户，端到端，在可见的 Chrome 中
node src/cli.js --count 5 --pool proxies.txt # 五个账户，每个使用一个出口
node src/cli.js --verify-only                # 重新验证 keys.txt 中已有的每个密钥
```

**必须使用可见（有头）浏览器**——Cloudflare 在 `/register` 上的插页在无头 Chrome 中无法通过，而且该质询还守卫着 `POST /api/verification` 和 `POST /api/user/register`。因此该标志默认是*关闭*的：`--headless` 仅用于实验。

只有在 `GET /v1/models` 和一次真实补全得到响应**之后**，密钥才会被写入 `keys.txt`，并且每个账户（邮箱、出口、额度、密钥、证明）都会追加到 `accounts.json`。

### 🖱️ 启动器

启动器会询问代理列表（可选——没有则 CLI 直连运行）和账户数量，记住两者，然后运行 CLI。`--verify-only` 会重新验证 `keys.txt` 中已有的密钥。

## ✅ 已验证可用 — 每个密钥都经过测试

以下每项检查均于 **2026-10-21** 在全新的公共出口上运行（全程无 VPN）。铸造流程前十个密钥由实验室的固定驱动程序驱动，而**第 11 个密钥由本包自身的 CLI 端到端驱动**verified**`node src/cli.js --verify-only`** 重新验证。

| 检查 | 结果 |
| --- | --- |
| **有头** Chrome 中的 `/register` 插页 | **已通过** — 2–14 轮点击，在每个成功通过的出口上 |
| 这些出口上的无头对照 | 同一时段 **0/9 通过** — 这就是该标志默认关闭的原因 |
| 本地化质询 | CF 以浏览器语言提供插页（在 `tr` Chrome 上显示 «Bir dakika lütfen…»，测量于 2026-10-21）→ 检测器测试的是**面板 SPA 根节点**，而非标题，并且 Chrome 被固定为 `--lang=en-US` |
| 邮件验证码 | 来自 `support@<panel-mail>` 的 **~15–25 秒**（«Wallaby邮箱验证邮件»），6 位字符验证码，有效期 10 分钟 |
| `POST /api/user/register?turnstile=` | **200**，带 `data.access_token`（JWT）；仅在请求体中携带 token 会返回 `Turnstile token 为空` |
| 控制台会话 | **Bearer JWT** — 没有它 `/api/user/self` 返回 401，带上它返回 200（`quota = 250000`） |
| 密钥路径 | `POST /api/token/` 200（请求体中无密钥）→ 列表返回**掩码**形式 → `POST /api/token/<id>/key` 返回 48 字符明文 |
| 每个密钥的 `GET /v1/models` | **200** — `kimi-k3`、`moonshotai/kimi-k3` |
| 每个密钥的 `POST /v1/chat/completions` | **200**，带 `content \|\| reasoning_content` — **11/11 个密钥存活** |
| 注册额度 | `quota = 250000` = **$0.50**，无需银行卡/手机号/邀请 |
| 速率限制 | 30 次调用突发 **28×200**，2 次代理失败，**0×429** |
| 吞吐量 | 在良好出口上**每个账户约 2–2.5 分钟**；坏出口会被跳过，最坏情况约 5 分钟 |

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 备注 |
| --- | --- | --- |
| 邮箱 | temp.tf 别名（`outlook`/`hotmail` 加号别名） | 每个账户一个地址；面板会拒绝 9 890 个一次性域名，而该系列是真实的 Microsoft 邮箱 |
| 插页 | **有头** Chrome 中的 `/register` | 该组件位于封闭的 shadow root 中，因此需穿透 DOM（`DOM.getDocument {pierce:true}`）并用真实鼠标事件点击该框；4–10 轮 |
| turnstile | 面板自身的组件（来自 `/api/status` 的 `turnstile_sitekey`） | 当页面自行解决时原生读取（773–794 字符的 token），否则以相同节奏挂载并点击 |
| 验证码 | `GET /api/verification?email=&turnstile=` → 邮件验证码 | token 必须放在**查询字符串**中；仅在请求体中该路由会返回 `Turnstile token 为空` |
| 注册 | `POST /api/user/register?turnstile=` | 发送一封 6 位字符验证码邮件（每个样本中均为十六进制，有效期 10 分钟，约 15–25 秒内从 `support@<panel-mail>` 送达） |
| 会话 | 来自注册/登录的 `data.access_token` JWT | 控制台使用 **Bearer** 认证，而非 cookie：没有该请求头时 `/api/user/self` 返回 `401 invalid access token` |
| 密钥 | `POST /api/token/` → `POST /api/token/<id>/key` | 创建返回 200 但**不带**密钥，列表返回**掩码**形式（`zcMh**********UCAK`）；明文仅来自 `/key` 路由 |
| 证明 | `GET /v1/models` + `POST /v1/chat/completions` | 直接从 Node 发起——中继不会质询 `/v1/*`；`content || reasoning_content` 计入 |

## ⚙️ CLI 选项

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

| 标志 | 默认值 | 含义 |
| --- | --- | --- |
| `--count N` | `1` | 要铸造的账户数量，一次一个浏览器 |
| `--pool FILE` | 若存在则为 `proxies.txt` | 每行一个出口（`http://`、`socks5://`）；没有则直连运行 |
| `--proxy URL` | — | 固定单个出口 |
| `--exits K` | `8` | 一个账户在放弃前可消耗的候选出口数量 |
| `--model ID` | `kimi-k3` | 用于存活关卡的模型 |
| `--port N` | 自动 | Chrome DevTools 端口 |
| `--headless` | 关闭 | 仅用于实验：Cloudflare 不会通过 |
| `--keep` | 关闭 | 运行结束时保持 Chrome 打开 |
| `--code-timeout S` | `360` | 等待邮件验证码的时长 |

## 🛰️ 在代理之后

**可选——大规模使用时推荐。** 没有代理池时，CLI 会说明这一点并直接连接；注册、密钥铸造和验证完全相同，只是数据包的来源不同。

使用代理池时，每次尝试都会获得**固定到该出口的独立浏览器**（Chrome 在启动时固定其代理），因此无法通过插页的出口只会消耗它自己的尝试，CLI 会转向下一个候选。可用的出口是那些其 IP 类别能被 Cloudflare 在有可见浏览器时容忍的出口；失效线路会表现为 `page-unhealthy-after-clear` 或 `chrome-error` 页面并被跳过。

浏览器环节不支持需要认证的代理——请使用 IP 白名单出口。轮换列表：某一小时的最佳出口往往第二天就失效了（测量于 2026-10-21：当天最可靠的出口在数小时内就停止响应）。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个经存活验证的密钥 — 已被 git 忽略 |
| `accounts.json` | 邮箱、出口、额度、密钥和关卡结果 — 按账户追加 — 已被 git 忽略 |
| `proxies.txt` | 你的出口，每行一个 — 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

默认值：`--prefix wallaby`、`--base-url https://api.wallabytoken.com/v1`、`--model kimi-k3`。模型以 `wallaby/kimi-k3` 形式提供。

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

默认值：`--prefix wallaby`、`--base-url https://api.wallabytoken.com/v1`、`--model kimi-k3`。模型以 `wallaby/kimi-k3` 形式提供。
## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 提供商提供什么 | 每个密钥一个账户 — $0.50 注册额度，kimi-k3 聊天已验证（必须使用可见浏览器） |
| 🔑 一个密钥能给你什么 | 一个限定于其自身账户的 API 密钥：下方端点上的 2 个模型 id，受你套餐的限制。额度属于**账户**，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 wallabytoken.com 和你配置的邮箱后端；密钥保留在你的机器上 |

## 🐞 问题

如果 Wallaby 更改其注册形态、Turnstile sitekey、控制台密钥路由或目录，工具会在该步骤停止并说明原因。请附上命令和确切输出**[提交 issue](../../issues)**。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey 贡献者

</div>