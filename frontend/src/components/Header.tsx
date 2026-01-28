import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { LoginButton } from "./LoginButton";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-title">
          vim-jp Profile Stats
        </Link>
        <div className="header-actions">
          {isLoading ? null : isAuthenticated ? (
            <div className="user-menu">
              {user?.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.githubLogin}
                  className="user-avatar"
                  width={32}
                  height={32}
                />
              )}
              <span className="user-name">{user?.githubLogin}</span>
              <Link to="/profile" className="header-link">
                プロフィール
              </Link>
              <button type="button" className="logout-button" onClick={logout}>
                ログアウト
              </button>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </nav>
    </header>
  );
}
