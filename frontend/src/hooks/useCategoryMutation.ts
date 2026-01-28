import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CreateCategoryInput, UpdateCategoryInput } from "../../api-types";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCategoryInput }) =>
      api.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useAddCategoryValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      value,
      displayOrder,
    }: {
      categoryId: number;
      value: string;
      displayOrder?: number;
    }) => api.addCategoryValue(categoryId, value, displayOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategoryValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      valueId,
    }: {
      categoryId: number;
      valueId: number;
    }) => api.deleteCategoryValue(categoryId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
