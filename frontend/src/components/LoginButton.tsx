import { useAuth } from "../hooks/useAuth";

export function LoginButton() {
  const { login } = useAuth();

  return (
    <button type="button" className="login-button" onClick={login}>
      GitHub でログイン
    </button>
  );
}
