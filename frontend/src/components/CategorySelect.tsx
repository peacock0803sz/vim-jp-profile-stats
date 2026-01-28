import { useCategory } from "../hooks/useCategories";
import type { Category } from "../../api-types";

interface CategorySelectProps {
  category: Category;
  value: string;
  onChange: (value: string) => void;
}

// カテゴリに定義済みの選択肢がある場合はセレクト、なければテキスト入力
export function CategorySelect({
  category,
  value,
  onChange,
}: CategorySelectProps) {
  const { data: detail } = useCategory(category.id);

  // getCategoryWithChildren が返す values フィールド
  const values =
    (detail as Category & { values?: Array<{ id: number; value: string }> })
      ?.values ?? [];

  if (values.length > 0) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="category-select"
      >
        <option value="">-- 選択してください --</option>
        {values.map((v) => (
          <option key={v.id} value={v.value}>
            {v.value}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`${category.name} を入力`}
      className="category-input"
    />
  );
}
