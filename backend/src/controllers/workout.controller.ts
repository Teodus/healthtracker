import { Request, Response, NextFunction } from 'express';
import { WorkoutService } from '@/services/health/workout.service';

export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  getWorkouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.workoutService.getWorkouts(
        req.user!.userId,
        req.query.date as string,
        req.query.week === 'true'
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workout = await this.workoutService.createWorkout(
        req.user!.userId,
        req.body
      );
      res.status(201).json(workout);
    } catch (error) {
      next(error);
    }
  };

  updateWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workout = await this.workoutService.updateWorkout(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.json(workout);
    } catch (error) {
      next(error);
    }
  };

  deleteWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.workoutService.deleteWorkout(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}