# Quickstart: vim-jp Profile Stats

開発環境のセットアップと基本的な操作手順。

## Prerequisites

- Node.js 22+ (LTS)
- pnpm 9+
- Git
- Terraform >= 1.9 (IaC 管理用、`tfenv` 推奨)
- Wrangler CLI (`pnpm add -g wrangler`、Cloudflare D1 マイグレーション用)

## Project Setup

### 1. リポジトリのクローン

```bash
git clone https://github.com/peacock0803sz/vim-jp-profile-stats.git
cd vim-jp-profile-stats
git checkout react-router
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集:
```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=file:./dev.db

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4. データベースのセットアップ

```bash
# マイグレーション実行
pnpm db:migrate

# 初期データ投入（カテゴリ）
pnpm db:seed
```

## Development

### 開発サーバーの起動

```bash
# 全サービス起動（frontend + api）
pnpm dev

# 個別起動
pnpm dev:frontend  # http://localhost:5173
pnpm dev:api       # http://localhost:3000
```

### テストの実行

```bash
# 全テスト
pnpm test

# ウォッチモード
pnpm test:watch

# カバレッジ
pnpm test:coverage
```

### Linting & Formatting (oxlint/oxfmt)

```bash
# Lint チェック
pnpm lint

# Lint 自動修正
pnpm lint:fix

# Format チェック
pnpm format:check

# Format 適用
pnpm format
```

**Note:** oxlint/oxfmt は Rust 製で非常に高速。ESLint/Prettier の代替。

## Project Structure

```
vim-jp-profile-stats/
├── frontend/                 # React Router アプリ
│   ├── src/
│   │   ├── routes/          # ページコンポーネント
│   │   ├── components/      # 共通コンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   └── lib/             # ユーティリティ
│   └── tests/
├── api/                      # Hono API
│   ├── src/
│   │   ├── routes/          # APIエンドポイント
│   │   ├── db/              # Drizzle スキーマ
│   │   └── services/        # ビジネスロジック
│   └── tests/
├── infra/                    # IaC (Terraform, Cloudflare モジュール構成)
│   └── modules/             # database, api, frontend
├── scripts/                  # マイグレーションスクリプト等
└── specs/                    # 仕様書
```

## Common Tasks

### Google Sheets からのデータ移行

```bash
# 移行スクリプト実行
pnpm migrate:sheets

# 検証
pnpm migrate:verify
```

### 新しいカテゴリの追加

1. データベースに追加:
```bash
pnpm db:studio  # Drizzle Studio 起動
```

2. または管理者API経由 (要管理者権限):
```bash
curl -X POST http://localhost:3000/admin/categories \
  -H "Content-Type: application/json" \
  --cookie "token=$JWT_TOKEN" \
  -d '{"name": "新しいカテゴリ", "parentId": null}'
```

### ビルド

```bash
# 本番ビルド
pnpm build

# プレビュー
pnpm preview
```

## Infrastructure (Terraform)

### Terraform セットアップ

```bash
# tfenv でバージョン管理（推奨）
tfenv install 1.9.0
tfenv use 1.9.0

# または直接インストール
# https://developer.hashicorp.com/terraform/install
```

### Cloudflare インフラ管理

```bash
# 初期化
terraform -chdir=infra init

# 差分確認（dev 環境）
terraform -chdir=infra plan \
  -var-file=environments/dev.tfvars

# 適用（dev 環境）
terraform -chdir=infra apply \
  -var-file=environments/dev.tfvars

# リソース状態確認
terraform -chdir=infra show
```

### D1 マイグレーション (Wrangler)

```bash
# Wrangler ログイン
wrangler login

# ローカル D1 マイグレーション実行
wrangler d1 migrations apply vim-jp-profile-stats-dev --local

# リモート D1 マイグレーション実行
wrangler d1 migrations apply vim-jp-profile-stats-prod --remote
```

**Note:** D1 スキーママイグレーションは Terraform では管理不可。Wrangler CLI で実行する。

### 環境変数

Terraform 変数は以下の方法で設定:

```bash
# 方法 1: 環境変数（CI/CD 推奨）
export TF_VAR_cloudflare_api_token="your-token"
export TF_VAR_github_client_id="your-id"
export TF_VAR_github_client_secret="your-secret"
export TF_VAR_jwt_secret="your-jwt-secret"

# 方法 2: .tfvars ファイル（ローカル開発）
# infra/environments/dev.tfvars を編集
# ※ .tfvars は .gitignore に追加済み
```

## Troubleshooting

### よくある問題

**Q: `pnpm dev` でエラーが出る**
```bash
# node_modules を再インストール
rm -rf node_modules
pnpm install
```

**Q: データベースエラー**
```bash
# DBをリセット
rm dev.db
pnpm db:migrate
pnpm db:seed
```

**Q: GitHub OAuth が動かない**
- `.env` の `GITHUB_CLIENT_ID` と `GITHUB_CLIENT_SECRET` を確認
- GitHub OAuth App のコールバック URL が `http://localhost:3000/api/auth/callback` になっているか確認

## API Documentation

開発サーバー起動後、以下で API ドキュメントを確認:
- OpenAPI Spec: `specs/react-router/contracts/openapi.yaml`
- Swagger UI: http://localhost:3000/docs (実装後)

## Contributing

1. 新しいブランチを作成: `git checkout -b feature/your-feature`
2. 変更をコミット: `git commit -m ":sparkles: Add your feature"`
3. プッシュ: `git push origin feature/your-feature`
4. Pull Request を作成
