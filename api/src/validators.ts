import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().optional(),
});

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        categoryId: z.number().int().positive(),
        answerValue: z.string().min(1),
      }),
    )
    .min(1),
});

export const createCategoryValueSchema = z.object({
  value: z.string().min(1).max(200),
  displayOrder: z.number().int().default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type CreateCategoryValueInput = z.infer<
  typeof createCategoryValueSchema
>;
