import { eq, sql, count } from "drizzle-orm";
import { categories, responseAnswers, responses } from "../db/schema";
import type { Database } from "../db/client";
import type { CategoryStats, CategoryStatsSummary, AnswerStatistic } from "../types";
import { getCategory } from "./categories";

export async function getAllStatistics(
  db: Database,
): Promise<CategoryStatsSummary[]> {
  // 各カテゴリの統計サマリーを取得
  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      parentId: categories.parentId,
      answerValue: responseAnswers.answerValue,
      count: count(),
    })
    .from(responseAnswers)
    .innerJoin(categories, eq(responseAnswers.categoryId, categories.id))
    .groupBy(categories.id, responseAnswers.answerValue)
    .orderBy(categories.displayOrder);

  // カテゴリごとにグループ化
  const grouped = new Map<
    number,
    {
      categoryName: string;
      parentId: number | null;
      answers: Array<{ value: string; count: number }>;
    }
  >();

  for (const row of rows) {
    if (!grouped.has(row.categoryId)) {
      grouped.set(row.categoryId, {
        categoryName: row.categoryName,
        parentId: row.parentId ?? null,
        answers: [],
      });
    }
    grouped.get(row.categoryId)!.answers.push({
      value: row.answerValue,
      count: row.count,
    });
  }

  const summaries: CategoryStatsSummary[] = [];
  for (const [categoryId, data] of grouped) {
    const totalResponses = data.answers.reduce((sum, a) => sum + a.count, 0);
    const top = data.answers.sort((a, b) => b.count - a.count)[0];

    summaries.push({
      categoryId,
      categoryName: data.categoryName,
      parentId: data.parentId,
      totalResponses,
      topAnswer: top?.value ?? "",
      topAnswerCount: top?.count ?? 0,
    });
  }

  return summaries;
}

export async function getCategoryStatistics(
  db: Database,
  categoryId: number,
): Promise<CategoryStats | null> {
  const category = await getCategory(db, categoryId);
  if (!category) return null;

  const rows = await db
    .select({
      answerValue: responseAnswers.answerValue,
      count: count(),
    })
    .from(responseAnswers)
    .where(eq(responseAnswers.categoryId, categoryId))
    .groupBy(responseAnswers.answerValue)
    .orderBy(sql`count(*) DESC`);

  const totalResponses = rows.reduce((sum, r) => sum + r.count, 0);

  const statistics: AnswerStatistic[] = rows.map((r) => ({
    answerValue: r.answerValue,
    count: r.count,
    percentage: totalResponses > 0 ? (r.count / totalResponses) * 100 : 0,
  }));

  return { category, totalResponses, statistics };
}
