import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function Root() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
