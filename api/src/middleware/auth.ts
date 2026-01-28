import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verifyJWT, getUserById } from "../services/auth";
import { createDb } from "../db/client";
import type { AppEnv } from "../index";
import type { User } from "../types";

type AuthVariables = {
  user: User;
};

export const authMiddleware = createMiddleware<
  AppEnv & { Variables: AuthVariables }
>(async (c, next) => {
  const token = getCookie(c, "token");
  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ message: "Invalid token" }, 401);
  }

  const db = createDb(c.env.DB);
  const user = await getUserById(db, payload.userId);
  if (!user) {
    return c.json({ message: "User not found" }, 401);
  }

  c.set("user", user);
  await next();
});
