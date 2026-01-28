import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  githubId: integer("github_id").notNull().unique(),
  githubLogin: text("github_login").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const categoryValues = sqliteTable(
  "category_values",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    value: text("value").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("idx_category_values_unique").on(table.categoryId, table.value),
  ],
);

export const responses = sqliteTable("responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  submittedAt: integer("submitted_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const responseAnswers = sqliteTable(
  "response_answers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    responseId: integer("response_id")
      .notNull()
      .references(() => responses.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    answerValue: text("answer_value").notNull(),
  },
  (table) => [
    uniqueIndex("idx_response_answers_unique").on(
      table.responseId,
      table.categoryId,
    ),
  ],
);
