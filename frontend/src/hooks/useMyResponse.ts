import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "./useAuth";
import type { SubmitResponseInput } from "../../api-types";

export function useMyResponse() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["responses", "me"],
    queryFn: () => api.getMyResponse(),
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useSubmitResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitResponseInput) => api.submitResponse(input),
    onSuccess: () => {
      // 回答送信後にキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["responses", "me"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}
