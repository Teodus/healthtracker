import { z } from 'zod';

export const CreateFoodEntrySchema = z.object({
  description: z.string().min(1).max(500),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
});

export const UpdateFoodEntrySchema = z.object({
  name: z.string().min(1).optional(),
  calories: z.number().positive().optional(),
  protein: z.number().min(0).optional(),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
});

export const FoodQuerySchema = z.object({
  date: z.string().optional(),
});

export type CreateFoodEntryDto = z.infer<typeof CreateFoodEntrySchema>;
export type UpdateFoodEntryDto = z.infer<typeof UpdateFoodEntrySchema>;