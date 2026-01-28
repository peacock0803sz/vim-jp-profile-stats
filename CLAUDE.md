# react-router Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-28

## Active Technologies

- TypeScript 5.x + React 19, React Router v7, Hono 4.x, Drizzle ORM, TanStack Query
- SQLite (開発: better-sqlite3) / Cloudflare D1 (本番)
- Terraform >= 1.9 + Cloudflare Provider ~> 5.16

## Project Structure

```text
frontend/              # React Router アプリ
api/                   # Hono API
infra/                 # Terraform IaC (Cloudflare モジュール構成)
  modules/             # database, api, frontend
scripts/               # マイグレーションスクリプト
specs/                 # 仕様書
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x: Follow standard conventions

## Recent Changes

- react-router: Added TypeScript 5.x + React 19, React Router v7, Hono 4.x, Drizzle ORM, TanStack Query
- react-router: Added Terraform IaC (Cloudflare)
- react-router: Added CI/CD (GitHub Actions + Dependabot + tflint/tfsec/tfcmt)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
