import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  preferences: z.object({
    darkMode: z.boolean().optional(),
    notifications: z.boolean().optional(),
  }).optional(),
});

export const UpdateGoalsSchema = z.object({
  calorieGoal: z.number().positive().int(),
  proteinGoal: z.number().positive().int(),
  workoutGoal: z.number().positive().int().max(7),
});

export const InitialSetupSchema = z.object({
  goals: z.object({
    calorieGoal: z.number().positive().int(),
    proteinGoal: z.number().positive().int(),
    workoutGoal: z.number().positive().int().max(7),
  }),
  habits: z.array(z.string().min(1).max(255)).max(10),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type UpdateGoalsDto = z.infer<typeof UpdateGoalsSchema>;
export type InitialSetupDto = z.infer<typeof InitialSetupSchema>;