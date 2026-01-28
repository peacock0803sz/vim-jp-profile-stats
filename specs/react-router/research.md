# Research: DB Storage with Nested Statistics

## 1. Architecture Decision: Streamlit → React Router + Hono

### Decision: フルスタック移行（React Router フロントエンド + Hono API バックエンド）

### Rationale
- ユーザー要件: Streamlitから脱却し、モダンなWebアプリケーションへ移行
- React Router: SPAルーティング、コンポーネントベースUI
- Hono: 軽量・高速なEdge対応APIフレームワーク
- 明確なフロントエンド/バックエンド分離

### Architecture Overview
```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  - React Router v7                      │
│  - TypeScript                           │
│  - Plotly.js / Recharts                 │
│  - TanStack Query (データ取得)          │
└────────────────┬────────────────────────┘
                 │ HTTP/JSON
                 ▼
┌─────────────────────────────────────────┐
│           Backend (Hono)                │
│  - Hono (TypeScript)                    │
│  - SQLite (better-sqlite3 / D1)         │
│  - GitHub OAuth                         │
└─────────────────────────────────────────┘
```

### Alternatives Considered
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Streamlit維持 | 既存コード活用 | 認証実装困難、UI制約 | ユーザー要件に合わない |
| Next.js | SSR、API Routes統合 | 重い、学習コスト | Honoの方が軽量 |
| FastAPI + React | Python継続 | 言語分離、デプロイ複雑 | 統一スタックの方がシンプル |

---

## 2. Database Selection

### Decision: SQLite (D1対応可能)

### Rationale
- データ規模が小さい（回答〜1,000件、カテゴリ値〜50件）
- Cloudflare D1への移行パスあり（Honoと相性良好）
- ローカル開発時は better-sqlite3
- Constitution「Simplicity」原則に合致

### Implementation
- 開発: better-sqlite3（Node.js native）
- 本番: Cloudflare D1 または SQLite ファイル

### Alternatives Considered
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| PostgreSQL | スケーラブル | 外部サービス必要 | オーバースペック |
| Firebase Firestore | Firebase Authと統合 | NoSQL、クエリ制限 | 集計クエリが複雑 |
| PlanetScale | MySQL互換、サーバーレス | 追加コスト | SQLiteで十分 |

---

## 3. Frontend Stack

### Decision: React Router v7 + TypeScript + Vite

### Rationale
- React Router v7: ファイルベースルーティング、データローディング統合
- TypeScript: 型安全、Constitution「Code Quality」に合致
- Vite: 高速ビルド、HMR
- TanStack Query: サーバー状態管理、キャッシュ

### Dependencies
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "plotly.js": "^2.0.0",
    "react-plotly.js": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

## 4. Backend Stack

### Decision: Hono + TypeScript + Drizzle ORM

### Rationale
- Hono: 軽量（12KB）、Edge対応、TypeScript first
- Drizzle ORM: 型安全、SQLiteサポート、軽量
- Cloudflare Workers / Node.js 両対応

### Dependencies
```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "drizzle-orm": "^0.30.0",
    "better-sqlite3": "^11.0.0",
    "@hono/zod-validator": "^0.4.0",
    "zod": "^3.0.0"
  }
}
```

### Project Structure
```
api/
├── src/
│   ├── index.ts          # Hono app entry
│   ├── routes/
│   │   ├── categories.ts
│   │   ├── responses.ts
│   │   ├── statistics.ts
│   │   └── auth.ts
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema
│   │   └── client.ts
│   └── services/
└── tests/
```

---

## 5. Authentication Implementation

### Decision: GitHub OAuth (Hono middleware)

### Rationale
- vim-jpコミュニティはGitHubユーザーが多い
- Hono用のOAuthミドルウェアあり
- JWTでセッション管理（Cookieベース）

### Flow
```
1. Frontend: /login → Backend: /api/auth/github
2. Backend: GitHub OAuth URL へリダイレクト
3. GitHub: 認可後 /api/auth/callback へリダイレクト
4. Backend: アクセストークン取得、JWT発行、Cookie設定
5. Frontend: /dashboard へリダイレクト
```

### Implementation
```typescript
// api/src/routes/auth.ts
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

const auth = new Hono()

auth.get('/github', (c) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user`
  return c.redirect(url)
})

auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  // Exchange code for token, create/get user, issue JWT
  setCookie(c, 'token', jwt, { httpOnly: true, secure: true })
  return c.redirect('/')
})
```

---

## 6. Data Migration Strategy

### Decision: Node.js マイグレーションスクリプト

### Rationale
- 一度きりの移行
- googleapis パッケージで Sheets API アクセス
- Drizzle ORM でDB書き込み

### Implementation
```typescript
// scripts/migrate.ts
import { google } from 'googleapis'
import { db } from '../api/src/db/client'
import { categories, responses, responseAnswers } from '../api/src/db/schema'

async function migrate() {
  const sheets = google.sheets({ version: 'v4', auth: API_KEY })
  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: '入力!A2:Z'
  })
  // Transform and insert...
}
```

---

## 7. Caching Strategy

### Decision: TanStack Query (フロントエンド) + Hono Cache (バックエンド)

### Rationale
- Constitution要件: キャッシュTTL 5分以上
- TanStack Query: staleTime 5分設定
- Hono: Cache-Control ヘッダー

### Implementation
```typescript
// Frontend
const { data } = useQuery({
  queryKey: ['statistics', categoryId],
  queryFn: () => fetchStatistics(categoryId),
  staleTime: 5 * 60 * 1000, // 5分
})

// Backend
app.get('/api/statistics/:id', cache({ maxAge: 300 }), async (c) => {
  // ...
})
```

---

## 8. Technology Stack Summary

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React 19 + React Router v7 | SPA、モダンUI |
| State | TanStack Query | サーバー状態管理 |
| Charts | Plotly.js | 対話的グラフ（既存継承） |
| Backend | Hono | 軽量、Edge対応 |
| ORM | Drizzle | 型安全、SQLite対応 |
| Database | SQLite / D1 | シンプル、十分なスケール |
| Auth | GitHub OAuth + JWT | コミュニティ親和性 |
| Language | TypeScript | 型安全（Constitution） |
| Build | Vite | 高速ビルド |
| Testing | Vitest | Vite統合 |
| Linting | oxlint | Rust製、超高速 |
| Formatting | oxfmt | oxlint統合、高速 |

---

## 9. Infrastructure Platform Comparison (Deep Dive)

### Option A: Cloudflare (Pages + Workers + D1)

| Component | Service | Terraform Resource | Cost (Free Tier) |
|-----------|---------|-------------------|------------------|
| Frontend | Pages | `cloudflare_pages_project` | 無制限ビルド、500回/月デプロイ |
| Frontend Domain | Pages Domain | `cloudflare_pages_domain` | 無料（Cloudflare DNS利用時） |
| Backend | Workers | `cloudflare_workers_script` | 100,000リクエスト/日 |
| Backend Domain | Workers Custom Domain | `cloudflare_workers_custom_domain` | 無料 |
| Database | D1 | `cloudflare_d1_database` | 5GB、5M行読み取り/日 |
| Cron | Workers Cron | `cloudflare_workers_cron_trigger` | 無料 |
| Auth | - | N/A | GitHub OAuth（無料） |

**Terraform Provider:** `cloudflare/cloudflare` v5.16.0（208 resources、351 data sources）

**Pros:**
- 統一プラットフォーム（管理が容易、Terraform リソース数 ~5個）
- Hono が Cloudflare 最適化済み
- Edge ロケーションでグローバル低遅延
- 無料枠が十分（小規模プロジェクト向き）
- `pages_project` が D1 バインディングをネイティブサポート（`d1_databases` 属性）
- D1 に `read_replication` (mode: "auto") が追加済み（読み取り性能向上）
- D1 に `primary_location_hint` で地域指定可能（"apac" = アジア太平洋）

**Cons:**
- D1 のスキーママイグレーションは Wrangler CLI 経由のみ（Terraform では管理不可）
- Workers の `content` / `content_file` でビルド済みJSをデプロイする必要あり
- v5.x で大幅な breaking changes あり（v4.x のリソース名変更多数）
- `cloudflare_workers_script` の `bindings` 構造が v5 で変更（`d1_database_binding` → `bindings` リスト）

**IaC 管理範囲:**
- ✅ D1 データベース作成、Pages プロジェクト、Workers スクリプト、カスタムドメイン、環境変数
- ❌ D1 スキーマ（マイグレーション）、Workers のコードデプロイ（CI/CD で別途管理推奨）

### Option B: Google Cloud (Cloud Run + Cloud SQL)

| Component | Service | Terraform Resource | Cost |
|-----------|---------|-------------------|------|
| Frontend | Cloud Storage + CDN | `google_storage_bucket` + `google_compute_backend_bucket` | ~$0.02/GB |
| Backend | Cloud Run v2 | `google_cloud_run_v2_service` | 2Mリクエスト/月無料 |
| Backend IAM | Cloud Run IAM | `google_cloud_run_v2_service_iam` | 無料 |
| Database | Cloud SQL (PostgreSQL 17) | `google_sql_database_instance` + `google_sql_database` + `google_sql_user` | ~$7/月（db-f1-micro） |
| Secrets | Secret Manager | `google_secret_manager_secret` + `_version` + `_iam_member` | 無料枠あり |
| Auth | Firebase Auth | 別途設定 | 50,000 MAU無料 |
| Container Registry | Artifact Registry | `google_artifact_registry_repository` | ~$0.10/GB |

**Terraform Provider:** `hashicorp/google` v7.16.0（1013 resources、428 data sources、6 functions）

**Pros:**
- エンタープライズグレードの信頼性
- Cloud SQL は PostgreSQL 17 まで対応、本番実績豊富
- Terraform エコシステムが最も成熟（1013 リソース）
- Cloud Run v2 は `cloud_sql_instance` volume mount でネイティブ接続
- Secret Manager 統合で環境変数の安全な管理
- `deletion_protection` がデフォルト有効（安全性）
- `scaling.min_instance_count = 0` でコスト最適化可能
- `startup_cpu_boost` でコールドスタート軽減

**Cons:**
- コストが Cloudflare より高い（Cloud SQL 最小 ~$7/月）
- 複数サービスの管理が必要（Terraform リソース数 ~15個）
- コールドスタート（Cloud Run、min_instance_count=0 時に 2-5 秒）
- IAM 設定が複雑（サービスアカウント、ロールバインディング）
- コンテナイメージのビルド・プッシュが必要（Cloudflare は JS ファイル直接デプロイ）
- VPC / Private IP 設定が必要な場合の追加複雑性

**IaC 管理範囲:**
- ✅ 全リソース（Cloud Run、Cloud SQL、Storage、IAM、Secret Manager、ネットワーク）
- ✅ Cloud SQL スキーマ（マイグレーションは別途だが Terraform で初期設定可能）
- ❌ コンテナイメージのビルド・プッシュ（CI/CD で管理）

### Platform Comparison Matrix

| 基準 | Cloudflare | Google Cloud |
|------|-----------|-------------|
| **月額コスト** | $0（無料枠内） | ~$7+（Cloud SQL） |
| **Terraform リソース数** | ~5 | ~15 |
| **セットアップ複雑度** | 低 | 高 |
| **DB 信頼性** | D1（GA、Read Replication対応） | Cloud SQL（実績豊富） |
| **コールドスタート** | なし（Edge） | あり（2-5秒、軽減可能） |
| **スケーラビリティ** | Edge で自動 | 手動設定（auto-scaling） |
| **Hono 互換性** | 最適化済み | Node.js コンテナ経由 |
| **日本リージョン** | Edge（自動） | asia-northeast1（東京） |
| **IaC 成熟度** | 中（v5 で改善） | 高（業界最成熟） |

### Decision: Cloudflare を採用（IaC 含む）

**Rationale:**
- データ規模が小さい（〜1,000件）→ D1 で十分
- コスト重視（個人/コミュニティプロジェクト）→ $0 vs $7+/月
- Hono + Cloudflare の相性の良さ → パフォーマンス要件を容易に達成
- Terraform リソース数が少ない → IaC のメンテナンスコスト低
- D1 が GA になり Read Replication もサポート → 信頼性向上
- Constitution「Simplicity」原則に最も合致

**他プラットフォームへの移行パス:**
- Drizzle ORM の adapter を切り替えるだけで DB 移行可能（SQLite → PostgreSQL）
- Hono は Node.js ランタイムでも動作 → 他ランタイムへのデプロイ可能

---

## 10. Infrastructure as Code (IaC) - Detailed Design

### Decision: Terraform + Cloudflare Provider v5.x（モジュール構成）

### Provider Versions

| Provider | Version | Registry |
|----------|---------|----------|
| cloudflare/cloudflare | ~> 5.16 | registry.terraform.io/providers/cloudflare/cloudflare |

### Alternatives Considered

| Tool | Pros | Cons | Decision |
|------|------|------|----------|
| Terraform | 業界標準、両プラットフォーム対応 | HCL学習コスト | ✅ 採用 |
| Pulumi | TypeScript対応 | Cloudflare対応が限定的 | ❌ 見送り |
| Wrangler (CLI) | Cloudflare公式、簡単 | 宣言的でない、環境管理困難 | 開発時のみ使用 |
| OpenTofu | Terraform互換、OSS | v5 provider 互換性未検証 | ❌ 見送り |

### IaC Project Structure

```
infra/
├── main.tf                 # root module: モジュール呼び出し + 環境設定
├── variables.tf            # root 変数定義（API token, account_id 等）
├── outputs.tf              # root 出力定義（URLs, IDs）
├── providers.tf            # プロバイダー設定 + backend
├── modules/
│   ├── database/           # D1 データベース
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── api/                # Workers スクリプト + バインディング
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── frontend/           # Pages プロジェクト + カスタムドメイン
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev.tfvars          # 開発環境
│   └── prod.tfvars         # 本番環境
└── .terraform-version      # tfenv 用バージョン指定
```

**Structure Decision:**
- 3つのモジュールに分割: database, api, frontend（論理的なコンポーネント単位）
- root module がモジュール間の依存を管理（database → api のバインディング等）
- staging 環境は省略（コミュニティプロジェクトでは dev/prod で十分）

### Cloudflare Terraform Configuration (Modular)

```hcl
# infra/providers.tf

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.16"
    }
  }

  # Terraform state は Terraform Cloud または S3 backend で管理
  # ローカル開発時は local backend
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
```

```hcl
# infra/variables.tf

variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be 'dev' or 'prod'."
  }
}

variable "github_client_id" {
  description = "GitHub OAuth App Client ID"
  type        = string
  sensitive   = true
}

variable "github_client_secret" {
  description = "GitHub OAuth App Client Secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "custom_domain" {
  description = "Custom domain for Pages (optional)"
  type        = string
  default     = ""
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "peacock0803sz"
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "vim-jp-profile-stats"
}
```

```hcl
# infra/main.tf (root module)

module "database" {
  source = "./modules/database"

  account_id  = var.cloudflare_account_id
  environment = var.environment
}

module "api" {
  source = "./modules/api"

  account_id          = var.cloudflare_account_id
  environment         = var.environment
  d1_database_id      = module.database.d1_database_id
  github_client_id    = var.github_client_id
  github_client_secret = var.github_client_secret
  jwt_secret          = var.jwt_secret
}

module "frontend" {
  source = "./modules/frontend"

  account_id       = var.cloudflare_account_id
  environment      = var.environment
  api_url          = module.api.api_url
  d1_database_id   = module.database.d1_database_id
  github_repo_owner = var.github_repo_owner
  github_repo_name  = var.github_repo_name
  custom_domain    = var.custom_domain
}
```

```hcl
# infra/outputs.tf

output "d1_database_id" {
  description = "D1 Database ID"
  value       = module.database.d1_database_id
}

output "api_url" {
  description = "API URL"
  value       = module.api.api_url
}

output "workers_script_name" {
  description = "Workers script name"
  value       = module.api.script_name
}

output "pages_project_name" {
  description = "Pages project name"
  value       = module.frontend.project_name
}

output "pages_subdomain" {
  description = "Pages subdomain URL"
  value       = module.frontend.subdomain
}
```

#### Module: database

```hcl
# infra/modules/database/variables.tf

variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}
```

```hcl
# infra/modules/database/main.tf

resource "cloudflare_d1_database" "main" {
  account_id            = var.account_id
  name                  = "vim-jp-profile-stats-${var.environment}"
  primary_location_hint = "apac"  # アジア太平洋（日本ユーザー向け最適化）
}
```

```hcl
# infra/modules/database/outputs.tf

output "d1_database_id" {
  description = "D1 Database ID"
  value       = cloudflare_d1_database.main.id
}

output "d1_database_name" {
  description = "D1 Database name"
  value       = cloudflare_d1_database.main.name
}
```

#### Module: api

```hcl
# infra/modules/api/variables.tf

variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "d1_database_id" {
  description = "D1 Database ID to bind"
  type        = string
}

variable "github_client_id" {
  description = "GitHub OAuth App Client ID"
  type        = string
  sensitive   = true
}

variable "github_client_secret" {
  description = "GitHub OAuth App Client Secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}
```

```hcl
# infra/modules/api/main.tf

resource "cloudflare_workers_script" "api" {
  account_id  = var.account_id
  script_name = "vim-jp-api-${var.environment}"
  main_module = "index.js"
  content     = file("${path.module}/../../../api/dist/index.js")

  compatibility_date  = "2025-01-01"
  compatibility_flags = ["nodejs_compat"]

  bindings = [
    {
      name = "DB"
      type = "d1"
      id   = var.d1_database_id
    },
    {
      name = "GITHUB_CLIENT_ID"
      type = "secret_text"
      text = var.github_client_id
    },
    {
      name = "GITHUB_CLIENT_SECRET"
      type = "secret_text"
      text = var.github_client_secret
    },
    {
      name = "JWT_SECRET"
      type = "secret_text"
      text = var.jwt_secret
    },
    {
      name = "ENVIRONMENT"
      type = "plain_text"
      text = var.environment
    }
  ]

  placement {
    mode = "smart"  # Smart Placement: DB に近い場所で実行
  }

  observability {
    enabled = true
    logs {
      enabled         = true
      invocation_logs = var.environment == "dev"
    }
  }
}
```

```hcl
# infra/modules/api/outputs.tf

output "script_name" {
  description = "Workers script name"
  value       = cloudflare_workers_script.api.script_name
}

output "api_url" {
  description = "API URL"
  value       = "https://${cloudflare_workers_script.api.script_name}.workers.dev"
}
```

#### Module: frontend

```hcl
# infra/modules/frontend/variables.tf

variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "api_url" {
  description = "API base URL for VITE_API_URL env var"
  type        = string
}

variable "d1_database_id" {
  description = "D1 Database ID for Pages binding"
  type        = string
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain for Pages (optional)"
  type        = string
  default     = ""
}
```

```hcl
# infra/modules/frontend/main.tf

resource "cloudflare_pages_project" "frontend" {
  account_id        = var.account_id
  name              = "vim-jp-stats-${var.environment}"
  production_branch = "main"

  build_config {
    build_command   = "pnpm build"
    destination_dir = "dist"
    root_dir        = "frontend"
    build_caching   = true
  }

  source {
    type = "github"
    config {
      owner                         = var.github_repo_owner
      repo_name                     = var.github_repo_name
      production_branch             = "main"
      deployments_enabled           = true
      production_deployments_enabled = true
      pr_comments_enabled           = true
      preview_deployment_setting    = "custom"
      preview_branch_includes       = ["react-router", "feature/*"]
    }
  }

  deployment_configs {
    production {
      compatibility_date = "2025-01-01"
      env_vars = {
        VITE_API_URL = {
          type  = "plain_text"
          value = var.api_url
        }
        NODE_ENV = {
          type  = "plain_text"
          value = "production"
        }
      }
      d1_databases = {
        DB = {
          id = var.d1_database_id
        }
      }
    }
    preview {
      compatibility_date = "2025-01-01"
      env_vars = {
        VITE_API_URL = {
          type  = "plain_text"
          value = "https://vim-jp-api-dev.workers.dev"
        }
        NODE_ENV = {
          type  = "plain_text"
          value = "development"
        }
      }
    }
  }
}

resource "cloudflare_pages_domain" "custom" {
  count        = var.custom_domain != "" ? 1 : 0
  account_id   = var.account_id
  project_name = cloudflare_pages_project.frontend.name
  domain       = var.custom_domain
}
```

```hcl
# infra/modules/frontend/outputs.tf

output "project_name" {
  description = "Pages project name"
  value       = cloudflare_pages_project.frontend.name
}

output "subdomain" {
  description = "Pages subdomain URL"
  value       = cloudflare_pages_project.frontend.subdomain
}
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test

  deploy-infra:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.0

      - name: Terraform Init
        run: terraform -chdir=infra init

      - name: Terraform Plan
        run: terraform -chdir=infra plan -var-file=environments/prod.tfvars -out=tfplan
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_VAR_cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_VAR_github_client_id: ${{ secrets.GH_OAUTH_CLIENT_ID }}
          TF_VAR_github_client_secret: ${{ secrets.GH_OAUTH_CLIENT_SECRET }}
          TF_VAR_jwt_secret: ${{ secrets.JWT_SECRET }}

      - name: Terraform Apply
        run: terraform -chdir=infra apply -auto-approve tfplan
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-db-migration:
    needs: deploy-infra
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          command: d1 migrations apply vim-jp-profile-stats-prod --remote
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Wrangler + Terraform の役割分担

| 責務 | ツール | 理由 |
|------|--------|------|
| リソース作成（D1, Pages, Workers） | Terraform | 宣言的管理、状態追跡 |
| D1 スキーママイグレーション | Wrangler CLI | Terraform では SQL 実行不可 |
| Workers コードデプロイ（開発） | Wrangler CLI | 高速イテレーション |
| Workers コードデプロイ（本番） | GitHub Actions + Terraform | 再現性、承認フロー |
| 環境変数・シークレット | Terraform | 一元管理、暗号化 |
| DNS レコード | Terraform | 変更追跡 |

---

## 11. CI/CD Pipeline Design (GitHub Actions + Dependabot)

### Decision: GitHub Actions + Cloudflare Pages Git Integration

### Rationale
- GitHub Actions: 業界標準、豊富なアクション、無料枠充実（2,000分/月）
- Cloudflare Pages: Git 連携で自動 Preview デプロイ（GitHub Actions 不要）
- Dependabot: GitHub ネイティブ、設定シンプル

### Terraform CI Tools

| ツール | 用途 | GitHub Action |
|-------|------|---------------|
| tflint | Linter（構文・ベストプラクティス） | `terraform-linters/setup-tflint` |
| tfsec | セキュリティスキャン | `aquasecurity/tfsec-action` |
| tfcmt | PR コメントフォーマッタ | `suzuki-shunsuke/tfcmt-action` |

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
├─────────────────────────────────────────────────────────────────┤
│  PR Created/Updated          │  Push to main                    │
│         ↓                    │         ↓                        │
│  ┌─────────────┐            │  ┌─────────────┐                  │
│  │   ci.yml    │            │  │ deploy.yml  │                  │
│  │ lint/test   │            │  │ infra+app   │                  │
│  │ tflint      │            │  │ tfcmt apply │                  │
│  │ tfsec       │            │  └─────────────┘                  │
│  │ tfcmt plan  │            │         ↓                        │
│  └─────────────┘            │  Terraform Apply                 │
│         ↓                    │  + Wrangler Migration            │
│  Cloudflare Pages            │                                  │
│  (Auto Preview)              │                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Files

#### 1. CI Workflow (PR / Push)

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, react-router]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  TERRAFORM_VERSION: "1.9.0"
  TFLINT_VERSION: "0.54.0"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Lint (oxlint)
        run: pnpm lint

      - name: Type Check
        run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Test (Vitest)
        run: pnpm test --coverage

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Build Frontend
        run: pnpm --filter frontend build

      - name: Build API
        run: pnpm --filter api build

      - name: Upload Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            frontend/dist
            api/dist
          retention-days: 1

  terraform-ci:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    defaults:
      run:
        working-directory: infra
    steps:
      - uses: actions/checkout@v4

      # Terraform Setup
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TERRAFORM_VERSION }}

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      # tflint
      - uses: terraform-linters/setup-tflint@v4
        with:
          tflint_version: v${{ env.TFLINT_VERSION }}

      - name: tflint Init
        run: tflint --init

      - name: tflint Run
        run: tflint --recursive --format compact

      # tfsec
      - name: tfsec
        uses: aquasecurity/tfsec-action@v1.0.3
        with:
          working_directory: infra
          soft_fail: true

      # tfcmt (PR only)
      - name: Setup tfcmt
        if: github.event_name == 'pull_request'
        uses: suzuki-shunsuke/tfcmt-action/setup@v1

      - name: Terraform Plan with tfcmt
        if: github.event_name == 'pull_request'
        run: |
          tfcmt plan -patch -- terraform plan -var-file=environments/prod.tfvars -no-color
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_VAR_cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_VAR_cloudflare_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          TF_VAR_github_client_id: ${{ secrets.GH_OAUTH_CLIENT_ID }}
          TF_VAR_github_client_secret: ${{ secrets.GH_OAUTH_CLIENT_SECRET }}
          TF_VAR_jwt_secret: ${{ secrets.JWT_SECRET }}
```

#### 2. Deploy Workflow (main only)

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-production
  cancel-in-progress: false

env:
  TERRAFORM_VERSION: "1.9.0"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test

      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            frontend/dist
            api/dist
          retention-days: 1

  deploy-infra:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
      pull-requests: write
      actions: read
    defaults:
      run:
        working-directory: infra
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TERRAFORM_VERSION }}

      - name: Terraform Init
        run: terraform init

      # tfcmt for apply
      - uses: suzuki-shunsuke/tfcmt-action/setup@v1

      - name: Terraform Apply with tfcmt
        run: |
          tfcmt apply -- terraform apply -var-file=environments/prod.tfvars -auto-approve
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_VAR_cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_VAR_cloudflare_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          TF_VAR_github_client_id: ${{ secrets.GH_OAUTH_CLIENT_ID }}
          TF_VAR_github_client_secret: ${{ secrets.GH_OAUTH_CLIENT_SECRET }}
          TF_VAR_jwt_secret: ${{ secrets.JWT_SECRET }}

  deploy-db-migration:
    needs: deploy-infra
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: cloudflare/wrangler-action@v3
        with:
          command: d1 migrations apply vim-jp-profile-stats-prod --remote
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

  deploy-workers:
    needs: [deploy-infra, deploy-db-migration]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - uses: cloudflare/wrangler-action@v3
        with:
          command: deploy --env production
          workingDirectory: api
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

#### 3. Dependabot Configuration

```yaml
# .github/dependabot.yml

version: 2

updates:
  # npm dependencies
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: "09:00"
      timezone: Asia/Tokyo
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - minor
          - patch
      react:
        patterns:
          - "react"
          - "react-dom"
          - "react-router"
          - "@tanstack/*"
      dev-tools:
        patterns:
          - "typescript"
          - "vite"
          - "vitest"
          - "oxlint"
        update-types:
          - minor
          - patch
    labels:
      - dependencies
      - javascript
    commit-message:
      prefix: ":arrow_up:"

  # GitHub Actions
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: "09:00"
      timezone: Asia/Tokyo
    labels:
      - dependencies
      - github-actions
    commit-message:
      prefix: ":arrow_up:"
    groups:
      actions:
        patterns:
          - "*"

  # Terraform providers
  - package-ecosystem: terraform
    directory: /infra
    schedule:
      interval: monthly
      time: "09:00"
      timezone: Asia/Tokyo
    labels:
      - dependencies
      - terraform
    commit-message:
      prefix: ":arrow_up:"
```

#### 4. Dependabot Auto-Merge

```yaml
# .github/workflows/dependabot-auto-merge.yml

name: Dependabot Auto-Merge

on:
  pull_request:

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: dependabot/fetch-metadata@v2
        id: metadata

      - name: Auto-merge minor/patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-minor' || steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 5. tflint Configuration

```hcl
# infra/.tflint.hcl

config {
  call_module_type = "local"
}

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

plugin "cloudflare" {
  enabled = true
  version = "0.9.0"
  source  = "github.com/cloudflare/tflint-ruleset-cloudflare"
}

rule "terraform_naming_convention" {
  enabled = true
}

rule "terraform_documented_variables" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = true
}
```

### GitHub Repository Secrets

| Secret | 用途 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Terraform + Wrangler 認証 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `GH_OAUTH_CLIENT_ID` | GitHub OAuth App Client ID |
| `GH_OAUTH_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `JWT_SECRET` | JWT 署名キー |

### Cloudflare Pages Git Integration

Cloudflare Pages は GitHub 連携で自動的に Preview/Production デプロイ:
- PR 作成時: Preview デプロイ（`*.pages.dev` サブドメイン）
- main push時: Production デプロイ

→ GitHub Actions での Pages デプロイは不要（Cloudflare が自動処理）

### CI/CD Pipeline Summary

| トリガー | Workflow | 主要 Jobs | 所要時間目安 |
|---------|----------|----------|-------------|
| PR 作成/更新 | ci.yml | lint, test, build, terraform-ci (tflint/tfsec/tfcmt) | ~4分 |
| PR (Dependabot) | dependabot-auto-merge.yml | auto-merge (minor/patch) | ~1分 |
| main push | deploy.yml | build, deploy-infra (tfcmt), deploy-db, deploy-workers | ~5分 |
| Cloudflare (自動) | - | Pages Preview/Production | ~2分 |

---

## 12. Open Questions (Deferred)

以下は実装フェーズで詳細化:
- GitHub OAuth App の具体的な設定（callback URL、scope）
- Terraform state backend の選定（Terraform Cloud vs S3 vs local）
- D1 マイグレーションの Wrangler 設定（`wrangler.toml`）
- Cloudflare Pages のプレビュー環境と D1 開発用 DB の分離方法
- カスタムドメインの DNS 設定（Cloudflare DNS への移管有無）
