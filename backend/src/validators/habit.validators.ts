import { z } from 'zod';

export const CreateHabitSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
});

export const UpdateHabitSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  active: z.boolean().optional(),
});

export const HabitQuerySchema = z.object({
  date: z.string().optional(),
});

export const ToggleHabitSchema = z.object({
  completed: z.boolean(),
});

export type CreateHabitDto = z.infer<typeof CreateHabitSchema>;
export type UpdateHabitDto = z.infer<typeof UpdateHabitSchema>;