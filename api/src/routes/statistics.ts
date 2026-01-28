import { Hono } from "hono";
import { createDb } from "../db/client";
import { getAllStatistics, getCategoryStatistics } from "../services/statistics";
import type { AppEnv } from "../index";

const statisticsRoute = new Hono<AppEnv>();

// GET /statistics - 全カテゴリの統計サマリー
statisticsRoute.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const result = await getAllStatistics(db);
  return c.json(result);
});

// GET /statistics/:id - 特定カテゴリの詳細統計
statisticsRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) {
    return c.json({ message: "Invalid category ID" }, 400);
  }

  const db = createDb(c.env.DB);
  const result = await getCategoryStatistics(db, id);
  if (!result) {
    return c.json({ message: "Category not found" }, 404);
  }

  return c.json(result);
});

export default statisticsRoute;
