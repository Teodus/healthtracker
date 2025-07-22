import { Router } from 'express';
import { HabitsController } from '@/controllers/habits.controller';
import { authenticate } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validate';
import { 
  CreateHabitSchema, 
  UpdateHabitSchema,
  HabitQuerySchema,
  ToggleHabitSchema 
} from '@/validators/habit.validators';

const router = Router();
const habitsController = new HabitsController();

// All routes require authentication
router.use(authenticate);

// Habit routes
router.get('/', habitsController.getHabits);
router.post('/', validate(CreateHabitSchema), habitsController.createHabit);
router.put('/:id', validate(UpdateHabitSchema), habitsController.updateHabit);
router.delete('/:id', habitsController.deleteHabit);

// Habit completion
router.put('/:id/complete', validate(ToggleHabitSchema), habitsController.toggleCompletion);

export default router;