import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { errorMiddleware } from "./middleware/error";
import type { Env } from "./db/client";

export type AppEnv = {
  Bindings: Env;
};

const app = new Hono<AppEnv>();

// グローバルミドルウェア
app.use("*", corsMiddleware());
app.onError(errorMiddleware);

// ヘルスチェック
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
