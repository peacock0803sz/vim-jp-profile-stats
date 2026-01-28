# Tasks: DB Storage with Nested Statistics Categories

**Input**: Design documents from `/specs/react-router/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/interfaces.md

**Organization**: Tasks are grouped by commit unit with Emoji Prefix.

## Format

```
## C[XX] `:emoji: commit message`
- [ ] T[XXX] Description with file path
```

- **C[XX]**: Commit number (logical unit)
- **backtick**: Actual git commit message (Emoji Prefix first)
- **T[XXX]**: Task ID within commit
- Exact file paths included

## Path Conventions

- **Frontend**: `frontend/src/`
- **API**: `api/src/`
- **Infrastructure**: `infra/`
- **Scripts**: `scripts/`

---

# Phase 0: Cleanup

## C01 `:fire: Remove legacy Python/Streamlit codebase`

- [x] T001 Delete Python source files (src/*.py, *.py at root)
- [x] T002 Delete Python configuration (pyproject.toml, uv.lock, .python-version, ruff.toml)
- [x] T003 Delete Python cache directories (.venv/, __pycache__/, .mypy_cache/, .ruff_cache/)
- [x] T004 Update .gitignore for Node.js project

**Checkpoint**: Legacy files removed

---

# Phase 1: Setup

## C02 `:tada: Initialize pnpm monorepo with TypeScript`

- [x] T005 Create pnpm-workspace.yaml
- [x] T006 Create root package.json with workspace scripts
- [x] T007 Create root tsconfig.json (base TypeScript config)
- [x] T008 Create .env.example with environment variables
- [x] T009 Configure oxlint in oxlint.json

## C03 `:sparkles: Scaffold frontend React Router project`

- [x] T010 Initialize frontend/package.json with React Router v7, TanStack Query, Plotly.js
- [x] T011 Create frontend/tsconfig.json extending root
- [x] T012 Create frontend/vite.config.ts
- [x] T013 Create frontend/index.html

## C04 `:sparkles: Scaffold api Hono project`

- [x] T014 Initialize api/package.json with Hono, Drizzle, Zod
- [x] T015 Create api/tsconfig.json extending root
- [x] T016 Create api/wrangler.toml for Cloudflare Workers/D1

## C05 `:wrench: Add Terraform Cloudflare modules`

- [x] T017 Create infra/providers.tf with Cloudflare provider
- [x] T018 Create infra/variables.tf with input variables
- [x] T019 Create infra/modules/database/main.tf (D1)
- [x] T020 Create infra/modules/api/main.tf (Workers)
- [x] T021 Create infra/modules/frontend/main.tf (Pages)
- [x] T022 Create infra/main.tf (root module)
- [x] T023 Create infra/outputs.tf
- [x] T024 Create infra/environments/dev.tfvars
- [x] T025 Create infra/.tflint.hcl

## C06 `:construction_worker: Add GitHub Actions workflows`

- [x] T026 Create .github/workflows/ci.yml (lint, test, build, terraform)
- [x] T027 Create .github/workflows/deploy.yml (production deployment)
- [x] T028 Create .github/dependabot.yml

**Checkpoint**: Project scaffolding complete

---

# Phase 2: Foundational

## C07 `:sparkles: Add Drizzle ORM schema and migrations`

- [ ] T029 Create api/src/db/schema.ts (users, categories, categoryValues, responses, responseAnswers)
- [ ] T030 Create api/src/db/client.ts (Drizzle client)
- [ ] T031 Create api/migrations/0001_initial.sql

## C08 `:label: Add shared types and Zod validators`

- [ ] T032 Create api/src/types.ts (shared TypeScript interfaces)
- [ ] T033 Create api/src/validators.ts (Zod schemas)

## C09 `:sparkles: Add Hono app with middleware`

- [ ] T034 Create api/src/index.ts (Hono app entry)
- [ ] T035 Create api/src/middleware/cors.ts
- [ ] T036 Create api/src/middleware/error.ts

## C10 `:lock: Add GitHub OAuth authentication`

- [ ] T037 Create api/src/services/auth.ts (JWT create/verify, user management)
- [ ] T038 Create api/src/middleware/auth.ts (JWT verification middleware)
- [ ] T039 Create api/src/routes/auth.ts (GET /auth/github, /auth/callback, /auth/me, POST /auth/logout)

## C11 `:sparkles: Add TanStack Query and API client`

- [ ] T040 Create frontend/src/lib/api.ts (API client)
- [ ] T041 Create frontend/src/lib/query.ts (QueryClient provider)

## C12 `:sparkles: Add React Router app shell`

- [ ] T042 Create frontend/src/main.tsx (app entry with providers)
- [ ] T043 Create frontend/src/routes/root.tsx (root layout)
- [ ] T044 Create frontend/src/components/Header.tsx
- [ ] T045 Create frontend/src/components/LoadingSpinner.tsx
- [ ] T046 Create frontend/src/components/ErrorBoundary.tsx

## C13 `:card_index: Add database seed script`

- [ ] T047 Create scripts/seed.ts (initial 19 categories)
- [ ] T048 Add seed script to package.json

**Checkpoint**: Foundation ready - User Story implementation can begin

---

# Phase 3: User Story 1 - View Nested Statistics (P1) MVP

## C14 `:sparkles: Add categories and statistics services` [US1]

- [ ] T049 Create api/src/services/categories.ts (getAllCategories, getCategory, getCategoryWithChildren)
- [ ] T050 Create api/src/services/statistics.ts (getAllStatistics, getCategoryStatistics)

## C15 `:sparkles: Add categories and statistics API routes` [US1]

- [ ] T051 Create api/src/routes/categories.ts (GET /categories, GET /categories/:id)
- [ ] T052 Create api/src/routes/statistics.ts (GET /statistics, GET /statistics/:id)

## C16 `:sparkles: Add statistics data hooks` [US1]

- [ ] T053 Create frontend/src/hooks/useCategories.ts
- [ ] T054 Create frontend/src/hooks/useStatistics.ts

## C17 `:lipstick: Add statistics UI components` [US1]

- [ ] T055 Create frontend/src/components/CategoryList.tsx
- [ ] T056 Create frontend/src/components/StatisticsChart.tsx (Plotly.js)
- [ ] T057 Create frontend/src/components/Breadcrumbs.tsx

## C18 `:sparkles: Add dashboard and category routes` [US1]

- [ ] T058 Create frontend/src/routes/index.tsx (dashboard)
- [ ] T059 Create frontend/src/routes/categories.$id.tsx (category detail with drill-down)

**Checkpoint**: US1 Complete - Statistics dashboard functional

---

# Phase 4: User Story 2 - Data Persistence (P2)

## C19 `:sparkles: Add response service and routes` [US2]

- [ ] T060 Create api/src/services/responses.ts (getResponseByUser)
- [ ] T061 Create api/src/routes/responses.ts (GET /responses)

## C20 `:alien: Add Google Sheets migration scripts` [US2]

- [ ] T062 Create scripts/sheets-client.ts (Google Sheets API client)
- [ ] T063 Create scripts/migrate.ts (migration logic)
- [ ] T064 Create scripts/verify.ts (data verification)
- [ ] T065 Create scripts/README.md (migration documentation)

**Checkpoint**: US2 Complete - Data persistence and migration working

---

# Phase 5: User Story 3 - Submit Profile (P3)

## C21 `:sparkles: Add response submission endpoint` [US3]

- [ ] T066 Extend api/src/routes/responses.ts (PUT /responses/me, GET /responses/me)
- [ ] T067 Extend api/src/services/responses.ts (submitResponse)

## C22 `:sparkles: Add auth context and hooks` [US3]

- [ ] T068 Create frontend/src/contexts/AuthContext.tsx
- [ ] T069 Create frontend/src/hooks/useAuth.ts
- [ ] T070 Create frontend/src/hooks/useMyResponse.ts

## C23 `:lipstick: Add auth UI components` [US3]

- [ ] T071 Create frontend/src/components/LoginButton.tsx
- [ ] T072 Update frontend/src/components/Header.tsx (add user menu)

## C24 `:lipstick: Add profile form components` [US3]

- [ ] T073 Create frontend/src/components/ProfileForm.tsx
- [ ] T074 Create frontend/src/components/CategorySelect.tsx

## C25 `:sparkles: Add auth and profile routes` [US3]

- [ ] T075 Create frontend/src/routes/login.tsx
- [ ] T076 Create frontend/src/routes/auth.callback.tsx
- [ ] T077 Create frontend/src/routes/profile.tsx

**Checkpoint**: US3 Complete - Profile submission form functional

---

# Phase 6: User Story 4 - Manage Categories (P4)

## C26 `:sparkles: Add admin category management API` [US4]

- [ ] T078 Extend api/src/middleware/auth.ts (admin role check)
- [ ] T079 Extend api/src/services/categories.ts (createCategory, updateCategory, duplicate check)
- [ ] T080 Create api/src/routes/admin/categories.ts (POST, PUT, DELETE /admin/categories)
- [ ] T081 Create api/src/routes/categoryValues.ts (POST, DELETE /categories/:id/values)

## C27 `:sparkles: Add admin hooks` [US4]

- [ ] T082 Create frontend/src/hooks/useCategoryMutation.ts

## C28 `:lipstick: Add admin UI components` [US4]

- [ ] T083 Create frontend/src/components/admin/CategoryForm.tsx
- [ ] T084 Create frontend/src/components/admin/CategoryValueForm.tsx

## C29 `:sparkles: Add admin routes` [US4]

- [ ] T085 Create frontend/src/routes/admin.tsx (admin layout)
- [ ] T086 Create frontend/src/routes/admin.categories.tsx (category list)
- [ ] T087 Create frontend/src/routes/admin.categories.$id.tsx (category detail)

**Checkpoint**: US4 Complete - Category management functional

---

# Phase 7: Polish

## C30 `:pencil: Update README and quickstart`

- [ ] T088 Update README.md with project overview
- [ ] T089 Validate and update quickstart.md

## C31 `:lipstick: Add responsive styles and UX polish`

- [ ] T090 Add responsive styles in frontend/src/styles/
- [ ] T091 Add staleTime optimization to TanStack Query hooks
- [ ] T092 Ensure loading states for all async operations

## C32 `:rocket: Validate Terraform deployment`

- [ ] T093 Test Terraform plan/apply for dev environment
- [ ] T094 Create infra/environments/prod.tfvars

---

# Dependencies & Execution Order

## Commit Dependencies

```
C01 (Cleanup)
 └── C02-C06 (Setup) [parallel within phase]
      └── C07-C13 (Foundational) [mostly sequential]
           ├── C14-C18 (US1) [sequential]
           ├── C19-C20 (US2) [can parallel with US1]
           ├── C21-C25 (US3) [after US1]
           └── C26-C29 (US4) [can parallel with US3]
                └── C30-C32 (Polish)
```

## Parallel Opportunities

| Phase | Parallel Commits |
|-------|-----------------|
| Setup | C02, C03, C04, C05, C06 |
| Foundational | C07 → C08 → C09 → C10, C11, C12 parallel after C09 |
| US1 | C14 → C15 → C16 → C17 → C18 |
| US2 | C19 → C20 |
| US3 | C21 → C22, C23 parallel → C24 → C25 |
| US4 | C26 → C27, C28 parallel → C29 |

---

# Implementation Strategy

## MVP (Minimum Viable Product)

**Commits: C01 → C02-C06 → C07-C13 → C14-C18**

Delivers:
- Clean TypeScript monorepo
- Functioning statistics dashboard
- Nested category navigation
- Plotly.js charts
- Seed data for demo

## Full Implementation Order

1. **C01**: :fire: Remove Python
2. **C02-C06**: :tada: :sparkles: :wrench: :construction_worker: Setup
3. **C07-C13**: :sparkles: :label: :lock: :card_index: Foundational
4. **C14-C18**: :sparkles: :lipstick: US1 — Dashboard MVP
5. **C19-C20**: :sparkles: :alien: US2 — Data migration
6. **C21-C25**: :sparkles: :lipstick: US3 — Profile form
7. **C26-C29**: :sparkles: :lipstick: US4 — Admin panel
8. **C30-C32**: :pencil: :lipstick: :rocket: Polish

---

# Emoji Reference

| Emoji | Usage |
|-------|-------|
| :fire: | コード/ファイル削除 |
| :tada: | 最初のコミット/新機能(大きめ) |
| :sparkles: | 新機能(小さめ) |
| :wrench: | 設定ファイル関連 |
| :construction_worker: | CI追加 |
| :label: | 型関連 |
| :lock: | セキュリティ関連 |
| :card_index: | メタデータ |
| :lipstick: | UI改善 |
| :alien: | 外部APIによる更新 |
| :pencil: | ドキュメント整備 |
| :rocket: | デプロイコミット |

---

# Summary

| Metric | Value |
|--------|-------|
| **Total Commits** | 32 |
| **Total Tasks** | 94 |
| **Cleanup** | 1 commit, 4 tasks |
| **Setup** | 5 commits, 24 tasks |
| **Foundational** | 7 commits, 20 tasks |
| **US1 (P1)** | 5 commits, 11 tasks |
| **US2 (P2)** | 2 commits, 6 tasks |
| **US3 (P3)** | 5 commits, 12 tasks |
| **US4 (P4)** | 4 commits, 10 tasks |
| **Polish** | 3 commits, 7 tasks |

---

# Notes

- Each commit should leave the codebase in a buildable state
- Commit messages use Emoji Prefix format (emoji first)
- Use `--amend` only for fixing the current commit, not previous ones
- Each checkpoint = deployable increment
