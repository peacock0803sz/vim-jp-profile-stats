import { Navigate, Outlet, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Component() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 管理者チェックはAPI側で行う (403が返る)
  // フロントエンドでは認証チェックのみ
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <Link to="/admin/categories">カテゴリ管理</Link>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
