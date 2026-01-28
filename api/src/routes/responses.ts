import { Hono } from "hono";
import { createDb } from "../db/client";
import { getResponseByUser } from "../services/responses";
import type { AppEnv } from "../index";

const responsesRoute = new Hono<AppEnv>();

// GET /responses - 全回答一覧 (public, 統計用)
responsesRoute.get("/", async (c) => {
  // TODO: ページネーション対応
  const db = createDb(c.env.DB);
  return c.json({ message: "Not yet implemented" }, 501);
});

export default responsesRoute;
