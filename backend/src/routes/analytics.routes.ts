import { Router } from 'express';
import { AnalyticsController } from '@/controllers/analytics.controller';
import { authenticate } from '@/middleware/auth';
import { analyticsRateLimiter } from '@/middleware/rateLimiter';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply rate limiting
router.use(analyticsRateLimiter);

// All routes require authentication
router.use(authenticate);

// Analytics routes
router.get('/daily-summary', analyticsController.getDailySummary);
router.get('/streak', analyticsController.getStreakData);

export default router;