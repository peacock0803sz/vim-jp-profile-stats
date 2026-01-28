import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getAllCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => api.getCategory(id),
    staleTime: 5 * 60 * 1000,
    enabled: id > 0,
  });
}
