import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { createDb } from "../db/client";
import { createJWT, verifyJWT, getOrCreateUser, getUserById } from "../services/auth";
import type { AppEnv } from "../index";

const auth = new Hono<AppEnv>();

// GitHub OAuth 開始
auth.get("/github", (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user`;
  return c.redirect(url);
});

// GitHub OAuth コールバック
auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.json({ message: "Missing code parameter" }, 400);
  }

  // アクセストークン取得
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!tokenData.access_token) {
    return c.json({ message: "Failed to get access token" }, 400);
  }

  // GitHub ユーザー情報取得
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/json",
    },
  });
  const githubUser = (await userRes.json()) as {
    id: number;
    login: string;
    avatar_url: string;
  };

  // DB にユーザー作成/取得
  const db = createDb(c.env.DB);
  const user = await getOrCreateUser(
    db,
    githubUser.id,
    githubUser.login,
    githubUser.avatar_url,
  );

  // JWT 発行
  const jwt = await createJWT({ userId: user.id }, c.env.JWT_SECRET);

  setCookie(c, "token", jwt, {
    httpOnly: true,
    secure: c.env.ENVIRONMENT !== "development",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日
  });

  const frontendUrl = c.env.FRONTEND_URL ?? "/";
  return c.redirect(frontendUrl);
});

// 現在のユーザー取得
auth.get("/me", async (c) => {
  const token = getCookie(c, "token");
  if (!token) {
    return c.json(null);
  }

  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json(null);
  }

  const db = createDb(c.env.DB);
  const user = await getUserById(db, payload.userId);
  return c.json(user);
});

// ログアウト
auth.post("/logout", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ message: "Logged out" });
});

export default auth;
