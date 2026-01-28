# TypeScript Interfaces: DB Storage with Nested Statistics

Hono API と React フロントエンド間で共有する型定義。

---

## 1. Database Schema (Drizzle ORM)

```typescript
// api/src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  githubId: integer('github_id').notNull().unique(),
  githubLogin: text('github_login').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id').references(() => categories.id),
  displayOrder: integer('display_order').notNull().default(0),
});

export const categoryValues = sqliteTable('category_values', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  value: text('value').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
});

export const responses = sqliteTable('responses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const responseAnswers = sqliteTable('response_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  responseId: integer('response_id').notNull().references(() => responses.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  answerValue: text('answer_value').notNull(),
});
```

---

## 2. API Request/Response Types

```typescript
// shared/types.ts (または api/src/types.ts)

// ============ User ============
export interface User {
  id: number;
  githubId: number;
  githubLogin: string;
  avatarUrl?: string;
  createdAt: Date;
}

// ============ Category ============
export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  displayOrder: number;
  children?: Category[];
}

export interface CreateCategoryInput {
  name: string;
  parentId?: number | null;
  displayOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: number | null;
  displayOrder?: number;
}

// ============ Response ============
export interface ResponseAnswer {
  categoryId: number;
  categoryName?: string;
  answerValue: string;
}

export interface Response {
  id: number;
  userId: number;
  submittedAt: Date;
  updatedAt: Date;
  answers: ResponseAnswer[];
}

export interface SubmitResponseInput {
  answers: Array<{
    categoryId: number;
    answerValue: string;
  }>;
}

// ============ Statistics ============
export interface AnswerStatistic {
  answerValue: string;
  count: number;
  percentage: number;
}

export interface CategoryStats {
  category: Category;
  totalResponses: number;
  statistics: AnswerStatistic[];
}

export interface CategoryStatsSummary {
  categoryId: number;
  categoryName: string;
  parentId: number | null;
  totalResponses: number;
  topAnswer: string;
  topAnswerCount: number;
}

// ============ Error ============
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

---

## 3. Zod Validation Schemas

```typescript
// api/src/validators.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().optional(),
});

export const submitResponseSchema = z.object({
  answers: z.array(z.object({
    categoryId: z.number().int().positive(),
    answerValue: z.string().min(1),
  })).min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
```

---

## 4. Service Interfaces

```typescript
// api/src/services/types.ts

export interface StatisticsService {
  getAllStatistics(): Promise<CategoryStatsSummary[]>;
  getCategoryStatistics(categoryId: number): Promise<CategoryStats>;
}

export interface CategoryService {
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | null>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(id: number, input: UpdateCategoryInput): Promise<Category>;
}

export interface ResponseService {
  getResponseByUser(userId: number): Promise<Response | null>;
  submitResponse(userId: number, input: SubmitResponseInput): Promise<Response>;
}

export interface AuthService {
  getOrCreateUser(githubId: number, githubLogin: string, avatarUrl?: string): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  createJWT(user: User): string;
  verifyJWT(token: string): { userId: number } | null;
}
```

---

## 5. React Query Hooks Interface

```typescript
// frontend/src/hooks/types.ts
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

// Statistics
export type UseAllStatisticsResult = UseQueryResult<CategoryStatsSummary[], Error>;
export type UseCategoryStatsResult = UseQueryResult<CategoryStats, Error>;

// Categories
export type UseCategoriesResult = UseQueryResult<Category[], Error>;

// Auth
export type UseCurrentUserResult = UseQueryResult<User | null, Error>;

// Response
export type UseMyResponseResult = UseQueryResult<Response | null, Error>;
export type UseSubmitResponseResult = UseMutationResult<Response, Error, SubmitResponseInput>;
```

---

## 6. API Client Interface

```typescript
// frontend/src/lib/api.ts

export interface ApiClient {
  // Statistics (public)
  getAllStatistics(): Promise<CategoryStatsSummary[]>;
  getCategoryStatistics(categoryId: number): Promise<CategoryStats>;

  // Categories (public read)
  getAllCategories(): Promise<Category[]>;
  getCategory(categoryId: number): Promise<Category>;

  // Auth
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;

  // Response (authenticated)
  getMyResponse(): Promise<Response | null>;
  submitResponse(input: SubmitResponseInput): Promise<Response>;
}

// Implementation
export function createApiClient(baseUrl: string): ApiClient {
  const fetcher = async <T>(path: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: 'include', // Cookie 送信
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'API Error');
    }

    return res.json();
  };

  return {
    getAllStatistics: () => fetcher('/statistics'),
    getCategoryStatistics: (id) => fetcher(`/statistics/${id}`),
    getAllCategories: () => fetcher('/categories'),
    getCategory: (id) => fetcher(`/categories/${id}`),
    getCurrentUser: () => fetcher('/auth/me'),
    logout: () => fetcher('/auth/logout', { method: 'POST' }),
    getMyResponse: () => fetcher('/responses/me'),
    submitResponse: (input) => fetcher('/responses/me', {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  };
}
```
