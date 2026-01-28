import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { errorMiddleware } from "./middleware/error";
import auth from "./routes/auth";
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

// ルート
app.route("/auth", auth);

export default app;
