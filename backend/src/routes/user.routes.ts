import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { 
  UpdateProfileSchema, 
  UpdateGoalsSchema, 
  InitialSetupSchema 
} from '@/validators/user.validators';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(UpdateProfileSchema), userController.updateProfile);

// Goals routes
router.get('/goals', userController.getGoals);
router.put('/goals', validate(UpdateGoalsSchema), userController.updateGoals);

// Initial setup
router.post('/initial-setup', validate(InitialSetupSchema), userController.initialSetup);

export default router;