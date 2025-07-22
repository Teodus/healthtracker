import { Request, Response, NextFunction } from 'express';
import { HabitsService } from '@/services/health/habits.service';

export class HabitsController {
  private habitsService: HabitsService;

  constructor() {
    this.habitsService = new HabitsService();
  }

  getHabits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.habitsService.getHabitsWithCompletions(
        req.user!.userId,
        req.query.date as string
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createHabit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const habit = await this.habitsService.createHabit(
        req.user!.userId,
        req.body
      );
      res.status(201).json(habit);
    } catch (error) {
      next(error);
    }
  };

  updateHabit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const habit = await this.habitsService.updateHabit(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  deleteHabit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.habitsService.deleteHabit(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  toggleCompletion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const completion = await this.habitsService.toggleHabitCompletion(
        req.params.id,
        req.user!.userId
      );
      
      res.json({
        id: req.params.id,
        completed: !!completion,
        completedAt: completion?.completedAt || null,
      });
    } catch (error) {
      next(error);
    }
  };
}