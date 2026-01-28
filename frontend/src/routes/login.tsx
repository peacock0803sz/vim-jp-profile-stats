import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { LoginButton } from "../components/LoginButton";

export function Component() {
  const { isAuthenticated, isLoading } = useAuth();

  // ログイン済みならプロフィールへリダイレクト
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="login-page">
      <h1>ログイン</h1>
      <p>GitHub アカウントでログインして、プロフィールを登録しましょう。</p>
      <LoginButton />
    </div>
  );
}
