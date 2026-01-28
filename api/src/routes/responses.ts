import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "../db/client";
import { getResponseByUser, submitResponse } from "../services/responses";
import { authMiddleware } from "../middleware/auth";
import { submitResponseSchema } from "../validators";
import type { AppEnv } from "../index";
import type { User } from "../types";

type AuthEnv = AppEnv & { Variables: { user: User } };

const responsesRoute = new Hono<AppEnv>();

// GET /responses - 全回答一覧 (public, 統計用)
responsesRoute.get("/", async (c) => {
  // TODO: ページネーション対応
  const db = createDb(c.env.DB);
  return c.json({ message: "Not yet implemented" }, 501);
});

// 認証済みユーザー向けエンドポイント
const meRoute = new Hono<AuthEnv>();
meRoute.use("*", authMiddleware);

// GET /responses/me - 自分の回答取得
meRoute.get("/", async (c) => {
  const user = c.get("user");
  const db = createDb(c.env.DB);
  const response = await getResponseByUser(db, user.id);

  if (!response) {
    return c.json({ message: "No response found" }, 404);
  }

  return c.json(response);
});

// PUT /responses/me - 自分の回答を送信/更新
meRoute.put(
  "/",
  zValidator("json", submitResponseSchema),
  async (c) => {
    const user = c.get("user");
    const db = createDb(c.env.DB);
    const input = c.req.valid("json");
    const response = await submitResponse(db, user.id, input);
    return c.json(response);
  },
);

responsesRoute.route("/me", meRoute);

export default responsesRoute;
