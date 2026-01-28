import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { count } from "drizzle-orm";
import { users, categories, categoryValues, responses, responseAnswers } from "../api/src/db/schema";

async function main() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./dev.db";
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  console.log("=== Database Verification ===\n");

  const [userCount] = await db.select({ count: count() }).from(users);
  console.log(`Users: ${userCount.count}`);

  const [catCount] = await db.select({ count: count() }).from(categories);
  console.log(`Categories: ${catCount.count}`);

  const [valCount] = await db.select({ count: count() }).from(categoryValues);
  console.log(`Category Values: ${valCount.count}`);

  const [resCount] = await db.select({ count: count() }).from(responses);
  console.log(`Responses: ${resCount.count}`);

  const [ansCount] = await db.select({ count: count() }).from(responseAnswers);
  console.log(`Response Answers: ${ansCount.count}`);

  console.log("\n=== Verification Complete ===");
  sqlite.close();
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
