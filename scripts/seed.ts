import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { categories } from "../api/src/db/schema";

const INITIAL_CATEGORIES = [
  "OS",
  "Shell",
  "端末ソフトウェア",
  "マルチターミナルプレクサ",
  "ブラウザ",
  "キーボード",
  "ポインティングデバイス",
  "IME",
  "Vim/Neovim",
  "プラグインマネージャー",
  "LSP",
  "補完",
  "Fuzzy Finder",
  "taskrunner",
  "colorscheme",
  "statusline",
  "snippet",
  "ファイラー",
  "ターミナル拡張",
];

async function main() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") ?? "./dev.db";
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  console.log("Seeding categories...");

  for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
    await db.insert(categories).values({
      name: INITIAL_CATEGORIES[i],
      parentId: null,
      displayOrder: i,
    });
  }

  console.log(`Seeded ${INITIAL_CATEGORIES.length} categories.`);
  sqlite.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
