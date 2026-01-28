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
