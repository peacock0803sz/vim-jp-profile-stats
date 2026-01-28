import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useAllStatistics() {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: () => api.getAllStatistics(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategoryStatistics(categoryId: number) {
  return useQuery({
    queryKey: ["statistics", categoryId],
    queryFn: () => api.getCategoryStatistics(categoryId),
    staleTime: 10 * 60 * 1000,
    enabled: categoryId > 0,
  });
}
