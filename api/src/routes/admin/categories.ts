import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "../../db/client";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  isDuplicateCategoryName,
  getCategory,
} from "../../services/categories";
import { authMiddleware, adminMiddleware } from "../../middleware/auth";
import { createCategorySchema, updateCategorySchema } from "../../validators";
import type { AuthEnv } from "../../middleware/auth";

const adminCategoriesRoute = new Hono<AuthEnv>();

adminCategoriesRoute.use("*", authMiddleware);
adminCategoriesRoute.use("*", adminMiddleware);

// POST /admin/categories - カテゴリ作成
adminCategoriesRoute.post(
  "/",
  zValidator("json", createCategorySchema),
  async (c) => {
    const db = createDb(c.env.DB);
    const input = c.req.valid("json");

    const duplicate = await isDuplicateCategoryName(
      db,
      input.name,
      input.parentId ?? null,
    );
    if (duplicate) {
      return c.json({ message: "Category name already exists in this level" }, 409);
    }

    const category = await createCategory(db, input);
    return c.json(category, 201);
  },
);

// PUT /admin/categories/:id - カテゴリ更新
adminCategoriesRoute.put(
  "/:id",
  zValidator("json", updateCategorySchema),
  async (c) => {
    const db = createDb(c.env.DB);
    const id = Number(c.req.param("id"));
    const input = c.req.valid("json");

    if (input.name) {
      const existing = await getCategory(db, id);
      const parentId = input.parentId !== undefined ? input.parentId : existing?.parentId ?? null;
      const duplicate = await isDuplicateCategoryName(db, input.name, parentId, id);
      if (duplicate) {
        return c.json({ message: "Category name already exists in this level" }, 409);
      }
    }

    const category = await updateCategory(db, id, input);
    if (!category) {
      return c.json({ message: "Category not found" }, 404);
    }

    return c.json(category);
  },
);

// DELETE /admin/categories/:id - カテゴリ削除
adminCategoriesRoute.delete("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const id = Number(c.req.param("id"));

  const deleted = await deleteCategory(db, id);
  if (!deleted) {
    return c.json({ message: "Category not found" }, 404);
  }

  return c.json({ message: "Deleted" });
});

export default adminCategoriesRoute;
