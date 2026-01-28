import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Database } from "../db/client";
import type { User } from "../types";

// Web Crypto API ベースの JWT (Cloudflare Workers 対応)
async function createHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function base64urlEncode(data: Uint8Array): string {
  const str = btoa(String.fromCharCode(...data));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function createJWT(
  payload: { userId: number },
  secret: string,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 }; // 7日

  const enc = new TextEncoder();
  const headerB64 = base64urlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(enc.encode(JSON.stringify(fullPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await createHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signingInput));
  const sigB64 = base64urlEncode(new Uint8Array(sig));

  return `${signingInput}.${sigB64}`;
}

export async function verifyJWT(
  token: string,
  secret: string,
): Promise<{ userId: number } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  const key = await createHmacKey(secret);
  const sig = base64urlDecode(sigB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sig,
    enc.encode(signingInput),
  );
  if (!valid) return null;

  const payload = JSON.parse(
    new TextDecoder().decode(base64urlDecode(payloadB64)),
  );
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  return { userId: payload.userId };
}

export async function getOrCreateUser(
  db: Database,
  githubId: number,
  githubLogin: string,
  avatarUrl?: string,
): Promise<User> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId))
    .get();

  if (existing) {
    return {
      id: existing.id,
      githubId: existing.githubId,
      githubLogin: existing.githubLogin,
      avatarUrl: existing.avatarUrl ?? undefined,
      createdAt: existing.createdAt,
    };
  }

  const result = await db
    .insert(users)
    .values({ githubId, githubLogin, avatarUrl })
    .returning()
    .get();

  return {
    id: result.id,
    githubId: result.githubId,
    githubLogin: result.githubLogin,
    avatarUrl: result.avatarUrl ?? undefined,
    createdAt: result.createdAt,
  };
}

export async function getUserById(
  db: Database,
  id: number,
): Promise<User | null> {
  const row = await db.select().from(users).where(eq(users.id, id)).get();
  if (!row) return null;

  return {
    id: row.id,
    githubId: row.githubId,
    githubLogin: row.githubLogin,
    avatarUrl: row.avatarUrl ?? undefined,
    createdAt: row.createdAt,
  };
}
