import { useState, useCallback, type FormEvent } from "react";
import {
  useCreateCategory,
  useUpdateCategory,
} from "../../hooks/useCategoryMutation";
import type { Category } from "../../../api-types";

interface CategoryFormProps {
  category?: Category;
  parentId?: number | null;
  onSuccess?: () => void;
}

export function CategoryForm({
  category,
  parentId,
  onSuccess,
}: CategoryFormProps) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    category?.displayOrder ?? 0,
  );

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const mutation = isEditing ? updateMutation : createMutation;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      if (isEditing && category) {
        updateMutation.mutate(
          { id: category.id, input: { name, displayOrder } },
          { onSuccess },
        );
      } else {
        createMutation.mutate(
          { name, parentId: parentId ?? null, displayOrder },
          { onSuccess },
        );
      }
    },
    [
      name,
      displayOrder,
      isEditing,
      category,
      parentId,
      createMutation,
      updateMutation,
      onSuccess,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="form-field">
        <label htmlFor="category-name">カテゴリ名</label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div className="form-field">
        <label htmlFor="category-order">表示順</label>
        <input
          id="category-order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending || !name.trim()}
        className="submit-button"
      >
        {mutation.isPending
          ? "保存中..."
          : isEditing
            ? "更新"
            : "作成"}
      </button>

      {mutation.isError && (
        <p className="form-error">エラー: {mutation.error.message}</p>
      )}
    </form>
  );
}
