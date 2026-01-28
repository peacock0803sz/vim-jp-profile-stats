import { useState, useCallback, type FormEvent } from "react";
import {
  useAddCategoryValue,
  useDeleteCategoryValue,
} from "../../hooks/useCategoryMutation";

interface CategoryValueFormProps {
  categoryId: number;
  values: Array<{ id: number; value: string }>;
}

export function CategoryValueForm({
  categoryId,
  values,
}: CategoryValueFormProps) {
  const [newValue, setNewValue] = useState("");
  const addMutation = useAddCategoryValue();
  const deleteMutation = useDeleteCategoryValue();

  const handleAdd = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!newValue.trim()) return;

      addMutation.mutate(
        { categoryId, value: newValue.trim() },
        { onSuccess: () => setNewValue("") },
      );
    },
    [categoryId, newValue, addMutation],
  );

  const handleDelete = useCallback(
    (valueId: number) => {
      deleteMutation.mutate({ categoryId, valueId });
    },
    [categoryId, deleteMutation],
  );

  return (
    <div className="category-value-form">
      <h3>選択肢</h3>

      <ul className="value-list">
        {values.map((v) => (
          <li key={v.id} className="value-item">
            <span>{v.value}</span>
            <button
              type="button"
              onClick={() => handleDelete(v.id)}
              disabled={deleteMutation.isPending}
              className="delete-button"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="add-value-form">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="新しい選択肢"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={addMutation.isPending || !newValue.trim()}
        >
          {addMutation.isPending ? "追加中..." : "追加"}
        </button>
      </form>

      {addMutation.isError && (
        <p className="form-error">エラー: {addMutation.error.message}</p>
      )}
    </div>
  );
}
