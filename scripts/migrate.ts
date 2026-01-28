import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { categories, responses, responseAnswers, users } from "../api/src/db/schema";
import { fetchSheetData } from "./sheets-client";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const API_KEY = process.env.GOOGLE_API_KEY ?? "";
const SHEET_RANGE = process.env.SHEET_RANGE ?? "入力!A1:Z";

async function main() {
  if (!SHEET_ID || !API_KEY) {
    console.error("GOOGLE_SHEET_ID and GOOGLE_API_KEY are required");
    process.exit(1);
  }

  const dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./dev.db";
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  console.log("Fetching data from Google Sheets...");
  const { headers, rows } = await fetchSheetData(API_KEY, SHEET_ID, SHEET_RANGE);

  console.log(`Found ${headers.length} columns, ${rows.length} rows`);

  // ヘッダーからカテゴリマッピングを構築
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map<string, number>();
  for (const cat of allCategories) {
    categoryMap.set(cat.name, cat.id);
  }

  // 匿名ユーザーを作成 (移行データ用)
  const anonymousUser = await db
    .insert(users)
    .values({
      githubId: 0,
      githubLogin: "_migrated",
      avatarUrl: null,
    })
    .returning()
    .get();

  let migratedCount = 0;

  for (const row of rows) {
    // 各行を1つの response として処理
    const response = await db
      .insert(responses)
      .values({ userId: anonymousUser.id })
      .returning()
      .get();

    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const header = headers[colIdx];
      const value = row[colIdx]?.trim();

      if (!value) continue;

      const categoryId = categoryMap.get(header);
      if (!categoryId) {
        console.warn(`Unknown category: "${header}", skipping`);
        continue;
      }

      await db.insert(responseAnswers).values({
        responseId: response.id,
        categoryId,
        answerValue: value,
      });
    }

    migratedCount++;
  }

  console.log(`Migration complete: ${migratedCount} responses migrated`);
  sqlite.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
