# Data Model: DB Storage with Nested Statistics

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│    User     │       │    Category     │       │  CategoryValue   │
├─────────────┤       ├─────────────────┤       ├──────────────────┤
│ id (PK)     │       │ id (PK)         │       │ id (PK)          │
│ github_id   │       │ name            │       │ category_id (FK) │
│ github_login│       │ parent_id (FK)  │◄──────┤ value            │
│ created_at  │       │ display_order   │       │ display_order    │
└──────┬──────┘       └────────┬────────┘       └──────────────────┘
       │                       │
       │                       │
       │ 1                     │ 1
       │                       │
       ▼ *                     ▼ *
┌─────────────────────────────────────────────┐
│                  Response                    │
├─────────────────────────────────────────────┤
│ id (PK)                                      │
│ user_id (FK)                                 │
│ submitted_at                                 │
│ updated_at                                   │
└──────────────────┬──────────────────────────┘
                   │
                   │ 1
                   │
                   ▼ *
          ┌─────────────────────┐
          │   ResponseAnswer    │
          ├─────────────────────┤
          │ id (PK)             │
          │ response_id (FK)    │
          │ category_id (FK)    │
          │ answer_value        │
          └─────────────────────┘
```

---

## Entities

### User（ユーザー）

回答を送信したユーザーを識別する。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | 内部ID |
| github_id | INTEGER | UNIQUE, NOT NULL | GitHub User ID |
| github_login | TEXT | NOT NULL | GitHub username |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | 初回登録日時 |

**Validation Rules:**
- github_id は GitHub OAuth から取得した値を使用
- 同一 github_id での重複登録は更新として扱う

**State Transitions:** N/A（状態遷移なし）

---

### Category（カテゴリ）

統計項目の分類。最大2階層の親子関係を持つ。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | 内部ID |
| name | TEXT | NOT NULL | カテゴリ名（日本語） |
| parent_id | INTEGER | FK(categories.id), NULL | 親カテゴリID（NULLはルート） |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 表示順序 |

**Validation Rules:**
- 階層は最大2レベル（parent_id が NULL または親の parent_id が NULL）
- name はカテゴリ内で一意

**Initial Data (19 root categories):**
```
OS, Shell, 端末ソフトウェア, マルチターミナルプレクサ, ブラウザ,
キーボード, ポインティングデバイス, IME, Vim/Neovim,
プラグインマネージャー, LSP, 補完, Fuzzy Finder, taskrunner,
colorscheme, statusline, snippet, ファイラー, ターミナル拡張
```

---

### CategoryValue（カテゴリ値）

各カテゴリで選択可能な値（選択肢）。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | 内部ID |
| category_id | INTEGER | FK(categories.id), NOT NULL | 所属カテゴリ |
| value | TEXT | NOT NULL | 選択肢の値 |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 表示順序 |

**Validation Rules:**
- 同一カテゴリ内で value は一意
- value は空文字を許容しない

**Example Values (OS category):**
```
macOS, Linux, Windows, BSD, Other
```

---

### Response（回答）

ユーザーからの1件の回答セット。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | 内部ID |
| user_id | INTEGER | FK(users.id), NOT NULL | 回答者 |
| submitted_at | DATETIME | NOT NULL, DEFAULT NOW | 初回送信日時 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW | 最終更新日時 |

**Validation Rules:**
- 1ユーザーにつき1件の Response のみ（UNIQUE on user_id）
- 再送信時は既存レコードを更新

**State Transitions:**
```
[新規] → submitted_at 設定
[更新] → updated_at のみ更新
```

---

### ResponseAnswer（回答詳細）

1つの回答における各カテゴリへの選択値。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTO | 内部ID |
| response_id | INTEGER | FK(responses.id), NOT NULL | 回答ID |
| category_id | INTEGER | FK(categories.id), NOT NULL | カテゴリID |
| answer_value | TEXT | NOT NULL | 回答値（自由入力または選択） |

**Validation Rules:**
- (response_id, category_id) の組み合わせは一意
- answer_value は CategoryValue.value に存在する値、または自由入力

**Note:** 自由入力を許容するため、CategoryValue との外部キー制約は設けない

---

## Indexes

```sql
-- 高速な統計集計用
CREATE INDEX idx_response_answers_category ON response_answers(category_id);

-- ユーザー検索用
CREATE INDEX idx_users_github_id ON users(github_id);

-- カテゴリ階層取得用
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- 回答のユーザー検索用
CREATE UNIQUE INDEX idx_responses_user ON responses(user_id);
```

---

## Migration Mapping (Google Sheets → DB)

| Sheets Column | Target Table | Target Field | Transform |
|---------------|--------------|--------------|-----------|
| (row position) | responses | id | AUTO |
| Column headers | categories | name | 1:1 mapping |
| Cell values | response_answers | answer_value | 1:1 mapping |

**Migration Notes:**
- Google Sheets にはユーザー情報がないため、移行時は匿名ユーザーとして扱う
- 移行後の新規回答のみ GitHub 認証必須

---

## Aggregate Views (for Statistics)

### category_statistics（統計ビュー）

```sql
CREATE VIEW category_statistics AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    c.parent_id,
    ra.answer_value,
    COUNT(*) AS count
FROM categories c
JOIN response_answers ra ON c.id = ra.category_id
GROUP BY c.id, ra.answer_value;
```

**Usage:**
```python
# カテゴリ別の統計取得
def get_category_stats(category_id: int) -> list[dict]:
    return db.execute(
        "SELECT answer_value, count FROM category_statistics WHERE category_id = ?",
        [category_id]
    ).fetchall()
```
