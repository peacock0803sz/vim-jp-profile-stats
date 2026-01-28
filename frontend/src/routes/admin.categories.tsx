import { useState } from "react";
import { Link } from "react-router";
import { useCategories } from "../hooks/useCategories";
import { useDeleteCategory } from "../hooks/useCategoryMutation";
import { CategoryForm } from "../components/admin/CategoryForm";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Category } from "../../api-types";

function CategoryRow({ category, depth = 0 }: { category: Category; depth?: number }) {
  const deleteMutation = useDeleteCategory();

  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${depth * 1.5}rem` }}>
          <Link to={`/admin/categories/${category.id}`}>{category.name}</Link>
        </td>
        <td>{category.displayOrder}</td>
        <td>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(category.id)}
            disabled={deleteMutation.isPending}
            className="delete-button"
          >
            削除
          </button>
        </td>
      </tr>
      {category.children?.map((child) => (
        <CategoryRow key={child.id} category={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function Component() {
  const { data: categories, isLoading } = useCategories();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-categories">
      <h1>カテゴリ管理</h1>

      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="toggle-button"
      >
        {showForm ? "キャンセル" : "新規カテゴリ作成"}
      </button>

      {showForm && (
        <CategoryForm onSuccess={() => setShowForm(false)} />
      )}

      <table className="category-table">
        <thead>
          <tr>
            <th>カテゴリ名</th>
            <th>表示順</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((cat) => (
            <CategoryRow key={cat.id} category={cat} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
