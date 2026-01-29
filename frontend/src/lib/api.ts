import type {
  Category,
  CategoryStats,
  CategoryStatsSummary,
  CreateCategoryInput,
  UpdateCategoryInput,
  Response,
  SubmitResponseInput,
  User,
} from "../../api-types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message ?? `API Error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Statistics (public)
  getAllStatistics: () => fetcher<CategoryStatsSummary[]>("/statistics"),
  getCategoryStatistics: (id: number) =>
    fetcher<CategoryStats>(`/statistics/${id}`),

  // Categories (public)
  getAllCategories: () => fetcher<Category[]>("/categories"),
  getCategory: (id: number) => fetcher<Category>(`/categories/${id}`),

  // Auth
  getCurrentUser: () => fetcher<User | null>("/auth/me"),
  logout: () => fetcher<void>("/auth/logout", { method: "POST" }),

  // Response (authenticated)
  getMyResponse: () => fetcher<Response | null>("/responses/me"),
  submitResponse: (input: SubmitResponseInput) =>
    fetcher<Response>("/responses/me", {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  // Admin: Categories
  createCategory: (input: CreateCategoryInput) =>
    fetcher<Category>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateCategory: (id: number, input: UpdateCategoryInput) =>
    fetcher<Category>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteCategory: (id: number) =>
    fetcher<void>(`/admin/categories/${id}`, { method: "DELETE" }),

  // Admin: Category Values
  addCategoryValue: (categoryId: number, value: string, displayOrder?: number) =>
    fetcher<{ id: number; categoryId: number; value: string }>(
      `/categories/${categoryId}/values`,
      {
        method: "POST",
        body: JSON.stringify({ value, displayOrder: displayOrder ?? 0 }),
      },
    ),
  deleteCategoryValue: (categoryId: number, valueId: number) =>
    fetcher<void>(`/categories/${categoryId}/values/${valueId}`, {
      method: "DELETE",
    }),
};
