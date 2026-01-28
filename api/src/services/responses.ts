import { eq } from "drizzle-orm";
import { responses, responseAnswers, categories } from "../db/schema";
import type { Database } from "../db/client";
import type { Response, SubmitResponseInput } from "../types";

export async function getResponseByUser(
  db: Database,
  userId: number,
): Promise<Response | null> {
  const response = await db
    .select()
    .from(responses)
    .where(eq(responses.userId, userId))
    .get();

  if (!response) return null;

  const answers = await db
    .select({
      categoryId: responseAnswers.categoryId,
      categoryName: categories.name,
      answerValue: responseAnswers.answerValue,
    })
    .from(responseAnswers)
    .innerJoin(categories, eq(responseAnswers.categoryId, categories.id))
    .where(eq(responseAnswers.responseId, response.id));

  return {
    id: response.id,
    userId: response.userId,
    submittedAt: response.submittedAt,
    updatedAt: response.updatedAt,
    answers,
  };
}

export async function submitResponse(
  db: Database,
  userId: number,
  input: SubmitResponseInput,
): Promise<Response> {
  // 既存の回答があれば更新、なければ新規作成
  const existing = await db
    .select()
    .from(responses)
    .where(eq(responses.userId, userId))
    .get();

  let responseId: number;

  if (existing) {
    // 既存の回答を更新
    await db
      .update(responses)
      .set({ updatedAt: new Date() })
      .where(eq(responses.id, existing.id));

    // 既存の回答詳細を削除
    await db
      .delete(responseAnswers)
      .where(eq(responseAnswers.responseId, existing.id));

    responseId = existing.id;
  } else {
    // 新規作成
    const result = await db
      .insert(responses)
      .values({ userId })
      .returning()
      .get();
    responseId = result.id;
  }

  // 回答詳細を挿入
  for (const answer of input.answers) {
    await db.insert(responseAnswers).values({
      responseId,
      categoryId: answer.categoryId,
      answerValue: answer.answerValue,
    });
  }

  return (await getResponseByUser(db, userId))!;
}
