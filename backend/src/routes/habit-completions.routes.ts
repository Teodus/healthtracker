import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { HabitsService } from '@/services/health/habits.service';
import { authenticate } from '@/middleware/auth';

const router = Router();
const habitsService = new HabitsService();

// Get today's habit completions
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await habitsService.getHabitsWithCompletions(req.user!.userId);
    
    // Transform to match frontend expectations
    const completions = result.habits
      .filter(h => h.completed)
      .map(h => ({
        habitId: h.id,
        completedAt: h.completedAt,
      }));
    
    res.json(completions);
  } catch (error) {
    next(error);
  }
});

export default router;