import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import foodRoutes from './food.routes';
import workoutRoutes from './workout.routes';
import habitRoutes from './habit.routes';
import habitCompletionsRoutes from './habit-completions.routes';
import voiceRoutes from './voice.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/food-entries', foodRoutes);
router.use('/workouts', workoutRoutes);
router.use('/habits', habitRoutes);
router.use('/habits/completions', habitCompletionsRoutes);
router.use('/voice', voiceRoutes);
router.use('/analytics', analyticsRoutes);

export default router;