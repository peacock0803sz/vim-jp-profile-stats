import type { ErrorHandler } from "hono";
import type { AppEnv } from "../index";

export const errorMiddleware: ErrorHandler<AppEnv> = (err, c) => {
  const status = "status" in err ? (err.status as number) : 500;
  const message = err.message || "Internal Server Error";

  if (status >= 500) {
    console.error(`[ERROR] ${err.message}`, err.stack);
  }

  return c.json(
    {
      message,
      code: err.name,
    },
    status as 400,
  );
};
