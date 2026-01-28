import { useAllStatistics } from "../hooks/useStatistics";
import { CategoryList } from "../components/CategoryList";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Component() {
  const { data: statistics, isLoading, error } = useAllStatistics();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="error">Failed to load statistics: {error.message}</p>;

  return (
    <div className="dashboard">
      <h1>vim-jp Profile Stats</h1>
      <p className="dashboard-description">
        vim-jp コミュニティメンバーの開発環境統計
      </p>
      <CategoryList statistics={statistics ?? []} />
    </div>
  );
}
