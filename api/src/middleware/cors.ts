import { cors } from "hono/cors";

export function corsMiddleware() {
  return cors({
    origin: (origin, c) => {
      const env = c.env as { FRONTEND_URL?: string; ENVIRONMENT?: string };
      const frontendUrl = env.FRONTEND_URL ?? "http://localhost:5173";

      if (env.ENVIRONMENT === "development") {
        return origin;
      }

      return frontendUrl;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  });
}
