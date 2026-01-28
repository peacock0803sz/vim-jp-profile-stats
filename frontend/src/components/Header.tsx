import { Link } from "react-router";

export function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-title">
          vim-jp Profile Stats
        </Link>
      </nav>
    </header>
  );
}
