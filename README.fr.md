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

**Créez en masse des comptes Wallaby avec des clés API — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://wallabytoken.com/pricing.json)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Niveau gratuit](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-2-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

Wallaby (wallabytoken.com) est une couche d'inférence basée à Sydney qui revend des modèles ouverts de pointe en USD prépayés, et **chaque nouveau compte commence avec 0,50 $ de crédit d'essai gratuit** — sans carte, sans téléphone, sans recharge. Aujourd'hui, le catalogue se résume à un seul modèle, **`kimi-k3`** (contexte de 1 M, raisonnement toujours actif), facturé à **2,70 $ en entrée / 13,50 $ en sortie par million de tokens** (0,27 $ en cache) — soit 10 % sous le tarif officiel de Kimi.

Le panneau est un fork de New API derrière **Cloudflare**, et Cloudflare constitue toute la difficulté : `/register` répond par un défi géré, et `POST /api/verification` ainsi que `POST /api/user/register` sont également soumis au défi — aucune clé n'existe donc sans un navigateur qui détient `cf_clearance`. Pire encore, le défi n'est franchi que par un navigateur **visible** : mesuré sur les mêmes sorties à la même heure, le mode headless a franchi **0/9** et le mode headful **3/3**. C'est pourquoi cet outil pilote un vrai Chrome headful (le README le répète, car une exécution headless ressemble exactement à un panneau cassé) et pourquoi un compte coûte quelques minutes plutôt qu'une seconde.

## 🎁 Niveau gratuit — ce que vous obtenez

| Quoi | Valeur |
| --- | --- |
| Crédit d'inscription | **0,50 $** — relu depuis la console sous la forme `quota = 250000` (`quota_per_unit = 500000`, USD 1:1) |
| Carte / téléphone | **ni l'un ni l'autre** — adresse e-mail + mot de passe + un code envoyé par e-mail + une vérification humaine |
| Expiration | **jamais** (« pas de carte · pas de recharge · n'expire jamais ») |
| Modèles du niveau gratuit | **`kimi-k3`** (+ alias `moonshotai/kimi-k3`) ; DeepSeek V4 Flash/Pro sont indiqués comme temporairement indisponibles |
| Prix | 2,70 $ en entrée / 13,50 $ en sortie / 0,27 $ en cache par million (tarif officiel Kimi **−10 %**) |
| Limite de débit | **aucune observée** — une rafale de 30 appels a répondu 28×200 sans aucun 429 (les deux autres étaient des échecs de proxy) |
| L'unité qui évolue | **un compte = une clé** ; le crédit est rattaché au compte, donc 10 clés = 10 × 0,50 $ |

> 💡 Le niveau gratuit est défini par Wallaby et peut changer. Consultez les chiffres en direct sur [wallabytoken.com](https://wallabytoken.com) — et laissez le propre contrôle de l'outil en décider :

```bash
```bash
# every key in keys.txt: the model list plus one real completion
node src/cli.js --verify-only

# or by hand (keys carry no `sk-` prefix)
curl https://api.wallabytoken.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"kimi-k3","messages":[{"role":"user","content":"gday"}],"max_tokens":64}'
```

`kimi-k3` is a reasoning model: a small `max_tokens` is consumed by `reasoning_tokens` and `content` comes back `null` even though the call succeeded — this tool counts `content || reasoning_content` as proof of life for exactly that reason.
```

## 🤖 Modèles — les 2 au complet

`GET /v1/models` sur une clé active (2026-10-21) :

| ID du modèle | Remarque |
| --- | --- |
| `kimi-k3` | le modèle pour lequel ce fournisseur existe — contexte de 1 M, raisonnement à poids ouverts, la réflexion facturée comme sortie |
| `moonshotai/kimi-k3` | le même modèle sous son id amont |

Les réponses nomment la pile de service plutôt que l'alias — `"model": "FW-Kimi-K3"` et `"model": "accounts/fireworks/models/kimi-k3"` — le backend est donc Fireworks. Le fournisseur publie une liste de prix lisible par machine sur [wallabytoken.com/pricing.json](https://wallabytoken.com/pricing.json).

## 🧪 Comment utiliser l'API

URL de base **`https://api.wallabytoken.com/v1`** — compatible OpenAI, et la documentation du fournisseur indique que la migration se fait en deux lignes (`base_url` et la clé).

Les clés font **48 caractères sans préfixe `sk-`** ; l'authentification se fait par jeton bearer à chaque requête.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.wallabytoken.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="kimi-k3",
      messages=[{"role":"user","content":"gday"}]).choices[0].message.reasoning_content)
```

La documentation du site promet l'absence de plafond de débit sur le niveau gratuit ; la mesure le confirme (30 appels rapides, zéro 429, latences de 2 à 36 s avec une queue en amont).

## 🛠 Démarrage rapide

```bash
cd wallaby-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 1                    # one account, end to end, in a visible Chrome
node src/cli.js --count 5 --pool proxies.txt # five accounts, one exit each
node src/cli.js --verify-only                # re-prove every key already in keys.txt
```

**Un navigateur visible (headful) est obligatoire** — l'interstitiel de Cloudflare sur `/register` ne se franchit pas dans Chrome headless, et le défi protège aussi `POST /api/verification` et `POST /api/user/register`. C'est pourquoi l'option est *désactivée* : `--headless` n'existe que pour les expérimentations.

Une clé n'est écrite dans `keys.txt` **qu'après** qu'un `GET /v1/models` et une vraie complétion ont répondu, et chaque compte (boîte mail, sortie, quota, clé, preuve) est ajouté à `accounts.json`.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys (facultative — sans elle, le CLI se connecte directement) et le nombre de comptes, mémorise les deux, puis exécute le CLI. `--verify-only` revérifie les clés déjà présentes dans `keys.txt`.

## ✅ Vérifié fonctionnel — chaque clé est testée

Chaque vérification ci-dessous a été effectuée le **2026-10-21** via de nouvelles sorties publiques (aucun VPN dans la boucle). Le flux de création a été piloté par le driver épinglé du labo pour les dix premières clés et par **le CLI de ce paquet de bout en bout pour la clé n° 11**verified**`node src/cli.js --verify-only`**.

| Vérification | Résultat |
| --- | --- |
| Interstitiel `/register` dans un Chrome **headful** | **franchi** — 2 à 14 tours de clics, sur chaque sortie qui est passée |
| Contrôle headless sur ces sorties | **0/9 franchissements** à la même heure — c'est pourquoi l'option est désactivée par défaut |
| Défi localisé | CF sert l'interstitiel dans la langue du navigateur (« Bir dakika lütfen… » sur un Chrome `tr`, mesuré le 2026-10-21) → le détecteur teste la **racine SPA du panneau**, pas le titre, et Chrome est épinglé sur `--lang=en-US` |
| Code envoyé par e-mail | **~15–25 s** depuis `support@<panel-mail>` (« Wallaby邮箱验证邮件 »), code de 6 caractères, valable 10 minutes |
| `POST /api/user/register?turnstile=` | **200** avec `data.access_token` (JWT) ; un token dans le corps seul répond `Turnstile token 为空` |
| Session console | **Bearer JWT** — `/api/user/self` renvoie 401 sans, 200 avec (`quota = 250000`) |
| Route de clé | `POST /api/token/` 200 (aucune clé dans le corps) → la liste la renvoie **masquée** → `POST /api/token/<id>/key` renvoie le texte en clair de 48 caractères |
| `GET /v1/models` par clé | **200** — `kimi-k3`, `moonshotai/kimi-k3` |
| `POST /v1/chat/completions` par clé | **200** avec `content \|\| reasoning_content` — **11/11 clés ACTIVES** |
| Crédit d'inscription | `quota = 250000` = **0,50 $**, sans carte/téléphone/invitation |
| Limite de débit | Rafale de 30 appels **28×200**, 2 échecs de proxy, **0×429** |
| Débit | **~2–2,5 min par compte** sur une bonne sortie ; une mauvaise sortie est ignorée, pire cas ~5 min |

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Wallaby page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.wallabytoken.com/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| boîte mail | alias temp.tf (`outlook`/`hotmail` plus-alias) | une adresse par compte ; le panneau rejette 9 890 domaines jetables, et cette famille est une vraie boîte Microsoft |
| interstitiel | `/register` dans un Chrome **headful** | le widget vit dans un shadow root fermé, donc le DOM est percé (`DOM.getDocument {pierce:true}`) et la case est cliquée avec de vrais événements souris ; 4 à 10 tours |
| turnstile | le widget du panneau lui-même (`turnstile_sitekey` issu de `/api/status`) | lu nativement quand la page le résout (tokens de 773–794 caractères), sinon monté et cliqué au même rythme |
| code | `GET /api/verification?email=&turnstile=` → code envoyé par e-mail | le token doit passer par la **chaîne de requête** ; dans le corps seul, la route répond `Turnstile token 为空` |
| inscription | `POST /api/user/register?turnstile=` | envoie un code de 6 caractères (hexadécimal dans tous les échantillons, valable 10 minutes, livré en ~15–25 s depuis `support@<panel-mail>`) |
| session | le JWT `data.access_token` issu de register/login | la console est authentifiée avec **Bearer**, pas des cookies : `/api/user/self` répond `401 invalid access token` sans l'en-tête |
| clé | `POST /api/token/` → `POST /api/token/<id>/key` | la création répond 200 **sans** clé et la liste la renvoie **masquée** (`zcMh**********UCAK`) ; le texte en clair ne vient que de la route `/key` |
| preuve | `GET /v1/models` + `POST /v1/chat/completions` | directement depuis Node — le relais ne soumet pas `/v1/*` au défi ; `content || reasoning_content` compte |

## ⚙️ Options du CLI

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

| Option | Défaut | Signification |
| --- | --- | --- |
| `--count N` | `1` | comptes à créer, un navigateur à la fois |
| `--pool FILE` | `proxies.txt` s'il existe | une sortie par ligne (`http://`, `socks5://`) ; sans cela, l'exécution est directe |
| `--proxy URL` | — | épingler une seule sortie |
| `--exits K` | `8` | combien de sorties candidates un compte peut consumer avant d'être abandonné |
| `--model ID` | `kimi-k3` | modèle utilisé pour le contrôle en direct |
| `--port N` | auto | port Chrome DevTools |
| `--headless` | désactivé | uniquement pour les expérimentations : Cloudflare ne franchira pas |
| `--keep` | désactivé | laisser Chrome ouvert à la fin de l'exécution |
| `--code-timeout S` | `360` | durée d'attente du code envoyé par e-mail |

## 🛰️ Derrière un proxy

**Facultatif — recommandé à grande échelle.** Sans pool, le CLI le signale et se connecte directement ; l'inscription, la création de clé et la vérification sont identiques, seule l'origine des paquets change.

Avec un pool, chaque tentative obtient **son propre navigateur épinglé à cette sortie** (Chrome fixe son proxy au lancement), donc une sortie qui ne franchit pas l'interstitiel ne coûte que sa propre tentative et le CLI passe au candidat suivant. Les sorties qui fonctionnent sont celles dont la classe d'IP est tolérée par Cloudflare avec un navigateur visible ; les lignes mortes se manifestent par `page-unhealthy-after-clear` ou une page `chrome-error` et sont ignorées.

Les proxys authentifiés ne sont pas pris en charge par la partie navigateur — utilisez des sorties avec liste blanche d'IP. Faites tourner la liste : la meilleure sortie d'une heure est souvent morte la suivante (mesuré le 2026-10-21 : la sortie la plus fiable du jour a cessé de répondre en quelques heures).

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé prouvée active par ligne — ignoré par git |
| `accounts.json` | boîte mail, sortie, quota, clé et résultat du contrôle — ajouté par compte — ignoré par git |
| `proxies.txt` | vos sorties, une par ligne — ignoré par git |

## 🔌 Connexion à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Défauts : `--prefix wallaby`, `--base-url https://api.wallabytoken.com/v1`, `--model kimi-k3`. Les modèles sont servis sous `wallaby/kimi-k3`.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **Wallaby** — [wallabytoken.com](https://wallabytoken.com) |
| 🎁 Ce que le fournisseur donne | un compte par clé — 0,50 $ de crédit d'inscription, kimi-k3 vérifié par chat (un navigateur visible est obligatoire) |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 2 ids de modèles sur le point de terminaison ci-dessous, dans les limites de votre forfait. Le quota est rattaché au **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | Compatible OpenAI : `POST https://api.wallabytoken.com/v1/chat/completions` |
| 🔒 Vos données | seuls wallabytoken.com et le backend de boîte mail que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si Wallaby modifie la structure de son inscription, sa sitekey Turnstile, la route de clé de la console ou le catalogue, l'outil s'arrête à cette étape et le signale. **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 wallaby-bulk-apikey contributors

</div>