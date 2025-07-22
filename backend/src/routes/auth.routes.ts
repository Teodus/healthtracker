import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { validate } from '@/middleware/validate';
import { authenticate } from '@/middleware/auth';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from '@/validators/auth.validators';

const router = Router();
const authController = new AuthController();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// Public routes
router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);

export default router;