-- 初期スキーマ: users, categories, category_values, responses, response_answers

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER NOT NULL UNIQUE,
  github_login TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE category_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE response_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER NOT NULL REFERENCES responses(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  answer_value TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_response_answers_category ON response_answers(category_id);
CREATE UNIQUE INDEX idx_category_values_unique ON category_values(category_id, value);
CREATE UNIQUE INDEX idx_response_answers_unique ON response_answers(response_id, category_id);
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- 統計集計用ビュー
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
