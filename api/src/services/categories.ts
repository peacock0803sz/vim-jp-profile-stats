import { eq, and, ne, isNull } from "drizzle-orm";
import { categories, categoryValues } from "../db/schema";
import type { Database } from "../db/client";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

export async function getAllCategories(db: Database): Promise<Category[]> {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.displayOrder);

  return buildCategoryTree(rows);
}

export async function getCategory(
  db: Database,
  id: number,
): Promise<Category | null> {
  const row = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .get();

  if (!row) return null;
  return { ...row, parentId: row.parentId ?? null };
}

export async function getCategoryWithChildren(
  db: Database,
  id: number,
): Promise<Category | null> {
  const parent = await getCategory(db, id);
  if (!parent) return null;

  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, id))
    .orderBy(categories.displayOrder);

  const values = await db
    .select()
    .from(categoryValues)
    .where(eq(categoryValues.categoryId, id))
    .orderBy(categoryValues.displayOrder);

  return {
    ...parent,
    children: children.map((c) => ({ ...c, parentId: c.parentId ?? null })),
    values: values.map((v) => ({ id: v.id, value: v.value })),
  } as Category & { values: Array<{ id: number; value: string }> };
}

function buildCategoryTree(
  rows: Array<{
    id: number;
    name: string;
    parentId: number | null;
    displayOrder: number;
  }>,
): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];

  for (const row of rows) {
    map.set(row.id, { ...row, parentId: row.parentId ?? null, children: [] });
  }

  for (const cat of map.values()) {
    if (cat.parentId === null) {
      roots.push(cat);
    } else {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children ??= [];
        parent.children.push(cat);
      }
    }
  }

  return roots;
}

// ============ Admin Operations ============

// 同階層での名前重複チェック
export async function isDuplicateCategoryName(
  db: Database,
  name: string,
  parentId: number | null,
  excludeId?: number,
): Promise<boolean> {
  const conditions = [eq(categories.name, name)];

  if (parentId === null) {
    conditions.push(isNull(categories.parentId));
  } else {
    conditions.push(eq(categories.parentId, parentId));
  }

  if (excludeId !== undefined) {
    conditions.push(ne(categories.id, excludeId));
  }

  const existing = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .get();

  return !!existing;
}

export async function createCategory(
  db: Database,
  input: CreateCategoryInput,
): Promise<Category> {
  const result = await db
    .insert(categories)
    .values({
      name: input.name,
      parentId: input.parentId ?? null,
      displayOrder: input.displayOrder ?? 0,
    })
    .returning()
    .get();

  return { ...result, parentId: result.parentId ?? null };
}

export async function updateCategory(
  db: Database,
  id: number,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const existing = await getCategory(db, id);
  if (!existing) return null;

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.parentId !== undefined) updates.parentId = input.parentId;
  if (input.displayOrder !== undefined) updates.displayOrder = input.displayOrder;

  if (Object.keys(updates).length === 0) return existing;

  await db.update(categories).set(updates).where(eq(categories.id, id));

  return (await getCategory(db, id))!;
}

export async function deleteCategory(
  db: Database,
  id: number,
): Promise<boolean> {
  const existing = await getCategory(db, id);
  if (!existing) return false;

  // 子カテゴリの値を先に削除
  await db.delete(categoryValues).where(eq(categoryValues.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));

  return true;
}
