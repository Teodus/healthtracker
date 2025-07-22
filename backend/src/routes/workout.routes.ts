import { Router } from 'express';
import { WorkoutController } from '@/controllers/workout.controller';
import { authenticate } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validate';
import { 
  CreateWorkoutSchema, 
  UpdateWorkoutSchema,
  WorkoutQuerySchema 
} from '@/validators/workout.validators';

const router = Router();
const workoutController = new WorkoutController();

// All routes require authentication
router.use(authenticate);

// Workout routes
router.get('/', workoutController.getWorkouts);
router.post('/', validate(CreateWorkoutSchema), workoutController.createWorkout);
router.put('/:id', validate(UpdateWorkoutSchema), workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

export default router;