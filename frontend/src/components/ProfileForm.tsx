import { useState, useCallback, useEffect, type FormEvent } from "react";
import { useCategories } from "../hooks/useCategories";
import { useMyResponse, useSubmitResponse } from "../hooks/useMyResponse";
import { CategorySelect } from "./CategorySelect";
import { LoadingSpinner } from "./LoadingSpinner";
import type { Category } from "../../api-types";

// カテゴリツリーからリーフノードを抽出
function flattenLeafCategories(categories: Category[]): Category[] {
  const leaves: Category[] = [];
  for (const cat of categories) {
    if (cat.children && cat.children.length > 0) {
      leaves.push(...flattenLeafCategories(cat.children));
    } else {
      leaves.push(cat);
    }
  }
  return leaves;
}

export function ProfileForm() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: myResponse, isLoading: responseLoading } = useMyResponse();
  const submitMutation = useSubmitResponse();

  const [answers, setAnswers] = useState<Map<number, string>>(new Map());

  const leafCategories = categories ? flattenLeafCategories(categories) : [];

  // 既存の回答をフォームに反映
  useEffect(() => {
    if (myResponse?.answers) {
      const existing = new Map<number, string>();
      for (const ans of myResponse.answers) {
        existing.set(ans.categoryId, ans.answerValue);
      }
      setAnswers(existing);
    }
  }, [myResponse]);

  const handleChange = useCallback((categoryId: number, value: string) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      if (value) {
        next.set(categoryId, value);
      } else {
        next.delete(categoryId);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const answerList = Array.from(answers.entries())
        .filter(([, v]) => v.length > 0)
        .map(([categoryId, answerValue]) => ({ categoryId, answerValue }));

      if (answerList.length === 0) return;

      submitMutation.mutate({ answers: answerList });
    },
    [answers, submitMutation],
  );

  if (categoriesLoading || responseLoading) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-categories">
        {leafCategories.map((cat) => (
          <div key={cat.id} className="form-field">
            <label htmlFor={`cat-${cat.id}`} className="form-label">
              {cat.name}
            </label>
            <CategorySelect
              category={cat}
              value={answers.get(cat.id) ?? ""}
              onChange={(value) => handleChange(cat.id, value)}
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={submitMutation.isPending || answers.size === 0}
        >
          {submitMutation.isPending ? "送信中..." : "プロフィールを保存"}
        </button>
        {submitMutation.isSuccess && (
          <p className="form-success">保存しました</p>
        )}
        {submitMutation.isError && (
          <p className="form-error">
            エラー: {submitMutation.error.message}
          </p>
        )}
      </div>
    </form>
  );
}
