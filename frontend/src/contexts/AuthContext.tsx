import { createContext, useCallback, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { User } from "../../api-types";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(() => {
    // GitHub OAuth フローを開始 (リダイレクト)
    window.location.href = `${API_BASE}/auth/github`;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
