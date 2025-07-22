import { Router } from 'express';
import { FoodController } from '@/controllers/food.controller';
import { authenticate } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validate';
import { 
  CreateFoodEntrySchema, 
  UpdateFoodEntrySchema,
  FoodQuerySchema 
} from '@/validators/food.validators';

const router = Router();
const foodController = new FoodController();

// All routes require authentication
router.use(authenticate);

// Food entry routes
router.get('/', foodController.getFoodEntries);
router.post('/', validate(CreateFoodEntrySchema), foodController.createFoodEntry);
router.put('/:id', validate(UpdateFoodEntrySchema), foodController.updateFoodEntry);
router.delete('/:id', foodController.deleteFoodEntry);

export default router;