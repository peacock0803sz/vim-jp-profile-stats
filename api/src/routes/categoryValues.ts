import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "../db/client";
import { categoryValues, categories } from "../db/schema";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { createCategoryValueSchema } from "../validators";
import type { AuthEnv } from "../middleware/auth";

const categoryValuesRoute = new Hono<AuthEnv>();

categoryValuesRoute.use("*", authMiddleware);
categoryValuesRoute.use("*", adminMiddleware);

// POST /categories/:id/values - カテゴリ値追加
categoryValuesRoute.post(
  "/:id/values",
  zValidator("json", createCategoryValueSchema),
  async (c) => {
    const db = createDb(c.env.DB);
    const categoryId = Number(c.req.param("id"));
    const input = c.req.valid("json");

    // カテゴリ存在確認
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .get();

    if (!category) {
      return c.json({ message: "Category not found" }, 404);
    }

    // 重複チェック
    const existing = await db
      .select()
      .from(categoryValues)
      .where(
        and(
          eq(categoryValues.categoryId, categoryId),
          eq(categoryValues.value, input.value),
        ),
      )
      .get();

    if (existing) {
      return c.json({ message: "Value already exists for this category" }, 409);
    }

    const result = await db
      .insert(categoryValues)
      .values({
        categoryId,
        value: input.value,
        displayOrder: input.displayOrder ?? 0,
      })
      .returning()
      .get();

    return c.json(result, 201);
  },
);

// DELETE /categories/:id/values/:valueId - カテゴリ値削除
categoryValuesRoute.delete("/:id/values/:valueId", async (c) => {
  const db = createDb(c.env.DB);
  const valueId = Number(c.req.param("valueId"));

  const existing = await db
    .select()
    .from(categoryValues)
    .where(eq(categoryValues.id, valueId))
    .get();

  if (!existing) {
    return c.json({ message: "Value not found" }, 404);
  }

  await db.delete(categoryValues).where(eq(categoryValues.id, valueId));
  return c.json({ message: "Deleted" });
});

export default categoryValuesRoute;
