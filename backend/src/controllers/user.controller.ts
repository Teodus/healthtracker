import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getProfile(req.user!.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.updateProfile(req.user!.userId, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  getGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goals = await this.userService.getGoals(req.user!.userId);
      
      if (!goals) {
        res.status(404).json({
          error: 'Goals not set',
          code: 'GOALS_NOT_FOUND',
        });
        return;
      }

      res.json(goals);
    } catch (error) {
      next(error);
    }
  };

  updateGoals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goals = await this.userService.updateGoals(req.user!.userId, req.body);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  };

  initialSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.completeInitialSetup(
        req.user!.userId,
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}