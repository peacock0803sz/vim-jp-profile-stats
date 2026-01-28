import { Hono } from "hono";
import { createDb } from "../db/client";
import { getAllCategories, getCategoryWithChildren } from "../services/categories";
import type { AppEnv } from "../index";

const categoriesRoute = new Hono<AppEnv>();

// GET /categories - 全カテゴリ取得 (ツリー構造)
categoriesRoute.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const result = await getAllCategories(db);
  return c.json(result);
});

// GET /categories/:id - カテゴリ詳細 (子カテゴリ + 選択肢)
categoriesRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid category ID" }, 400);
  }

  const db = createDb(c.env.DB);
  const result = await getCategoryWithChildren(db, id);
  if (!result) {
    return c.json({ message: "Category not found" }, 404);
  }

  return c.json(result);
});

export default categoriesRoute;
