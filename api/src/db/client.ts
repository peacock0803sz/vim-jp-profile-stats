import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Env = {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  FRONTEND_URL: string;
  ADMIN_GITHUB_IDS: string; // カンマ区切りの GitHub ID リスト
};

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
