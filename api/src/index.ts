import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { errorMiddleware } from "./middleware/error";
import auth from "./routes/auth";
import categoriesRoute from "./routes/categories";
import statisticsRoute from "./routes/statistics";
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
app.route("/categories", categoriesRoute);
app.route("/statistics", statisticsRoute);

export default app;
