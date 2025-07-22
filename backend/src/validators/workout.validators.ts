import { z } from 'zod';

export const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['cardio', 'strength', 'flexibility', 'sports', 'other']),
  duration: z.number().positive().int(),
  calories: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateWorkoutSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['cardio', 'strength', 'flexibility', 'sports', 'other']).optional(),
  duration: z.number().positive().int().optional(),
  calories: z.number().min(0).optional(),
  completed: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export const WorkoutQuerySchema = z.object({
  date: z.string().optional(),
  week: z.string().optional(),
});

export type CreateWorkoutDto = z.infer<typeof CreateWorkoutSchema>;
export type UpdateWorkoutDto = z.infer<typeof UpdateWorkoutSchema>;