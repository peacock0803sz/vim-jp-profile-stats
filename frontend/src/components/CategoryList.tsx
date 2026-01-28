import { Link } from "react-router";
import type { CategoryStatsSummary } from "../../api-types";

interface Props {
  statistics: CategoryStatsSummary[];
}

export function CategoryList({ statistics }: Props) {
  if (statistics.length === 0) {
    return <p>No statistics available yet.</p>;
  }

  return (
    <div className="category-list">
      {statistics.map((stat) => (
        <Link
          key={stat.categoryId}
          to={`/categories/${stat.categoryId}`}
          className="category-card"
        >
          <h3>{stat.categoryName}</h3>
          <div className="category-card-stats">
            <span className="total">{stat.totalResponses} responses</span>
            {stat.topAnswer && (
              <span className="top-answer">
                Top: {stat.topAnswer} ({stat.topAnswerCount})
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
