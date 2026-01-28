import { eq, isNull } from "drizzle-orm";
import { categories, categoryValues } from "../db/schema";
import type { Database } from "../db/client";
import type { Category } from "../types";

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
