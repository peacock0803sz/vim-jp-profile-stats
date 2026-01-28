# vim-jp Profile Stats

[vim-jp 環境調査シート](https://docs.google.com/spreadsheets/d/1o9bzmYKO0cKI3GQWSJePM_GrfnJRPGW3FdmyVLeP1JY/edit?gid=1002242431#gid=1002242431) の回答をDB管理し、統計ダッシュボードとして可視化するWebアプリ。

## Tech Stack

- **Frontend**: React 19 + React Router v7 + TanStack Query + Plotly.js
- **API**: Hono on Cloudflare Workers + Drizzle ORM + Zod
- **Database**: SQLite (dev) / Cloudflare D1 (prod)
- **Infrastructure**: Terraform (Cloudflare)
- **CI/CD**: GitHub Actions

## Features

- ネストされたカテゴリ統計の閲覧 (ドリルダウン)
- Plotly.js による統計チャート
- GitHub OAuth によるプロフィール登録
- 管理者によるカテゴリ管理
- Google Sheets からのデータ移行

## Quick Start

```bash
# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env
# .env を編集

# DB セットアップ
pnpm db:migrate
pnpm db:seed

# 開発サーバー起動
pnpm dev
```

詳細は [quickstart.md](specs/react-router/quickstart.md) を参照。

## Project Structure

```
frontend/     # React Router アプリ (Vite)
api/          # Hono API (Cloudflare Workers)
infra/        # Terraform IaC (Cloudflare)
scripts/      # 移行スクリプト
specs/        # 仕様書
```

## Development

```bash
pnpm dev           # 全サービス起動
pnpm test          # テスト実行
pnpm lint          # Lint チェック
pnpm build         # 本番ビルド
```

## License

MIT
