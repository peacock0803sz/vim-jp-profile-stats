import { useParams, Link } from "react-router";
import { useCategory } from "../hooks/useCategories";
import { CategoryForm } from "../components/admin/CategoryForm";
import { CategoryValueForm } from "../components/admin/CategoryValueForm";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Category } from "../../api-types";

export function Component() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { data: category, isLoading } = useCategory(categoryId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <div>
        <p>カテゴリが見つかりません</p>
        <Link to="/admin/categories">一覧に戻る</Link>
      </div>
    );
  }

  // getCategoryWithChildren が返す values フィールド
  const values =
    (category as Category & { values?: Array<{ id: number; value: string }> })
      ?.values ?? [];

  return (
    <div className="admin-category-detail">
      <Link to="/admin/categories">&larr; 一覧に戻る</Link>

      <h1>カテゴリ編集: {category.name}</h1>

      <section className="edit-section">
        <h2>基本情報</h2>
        <CategoryForm category={category} />
      </section>

      <section className="edit-section">
        <CategoryValueForm categoryId={category.id} values={values} />
      </section>

      {category.children && category.children.length > 0 && (
        <section className="edit-section">
          <h2>子カテゴリ</h2>
          <ul>
            {category.children.map((child) => (
              <li key={child.id}>
                <Link to={`/admin/categories/${child.id}`}>{child.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
