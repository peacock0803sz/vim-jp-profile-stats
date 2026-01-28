import { useParams } from "react-router";
import { useCategoryStatistics } from "../hooks/useStatistics";
import { StatisticsChart } from "../components/StatisticsChart";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Component() {
  const { id } = useParams();
  const categoryId = Number(id);
  const { data, isLoading, error } = useCategoryStatistics(categoryId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="error">Failed to load: {error.message}</p>;
  if (!data) return <p>Category not found.</p>;

  return (
    <div className="category-detail">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/" },
          { label: data.category.name },
        ]}
      />
      <h1>{data.category.name}</h1>
      <p>{data.totalResponses} responses</p>
      <StatisticsChart
        title={data.category.name}
        statistics={data.statistics}
      />
    </div>
  );
}
