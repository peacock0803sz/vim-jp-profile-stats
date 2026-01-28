import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "../components/LoadingSpinner";

// OAuth コールバック後のリダイレクト先
// API がクッキーをセットして FRONTEND_URL/auth/callback にリダイレクトする想定
export function Component() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // 認証キャッシュを無効化してユーザー情報を再取得
    queryClient.invalidateQueries({ queryKey: ["auth"] }).then(() => {
      navigate("/profile", { replace: true });
    });
  }, [queryClient, navigate]);

  return (
    <div className="auth-callback">
      <LoadingSpinner />
      <p>ログイン中...</p>
    </div>
  );
}
