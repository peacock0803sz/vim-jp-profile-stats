import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ProfileForm } from "../components/ProfileForm";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Component() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 未ログインならログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page">
      <h1>プロフィール編集</h1>
      <p className="profile-user">
        {user?.githubLogin} としてログイン中
      </p>
      <ProfileForm />
    </div>
  );
}
