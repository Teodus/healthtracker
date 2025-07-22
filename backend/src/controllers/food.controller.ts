import { Request, Response, NextFunction } from 'express';
import { FoodService } from '@/services/health/food.service';

export class FoodController {
  private foodService: FoodService;

  constructor() {
    this.foodService = new FoodService();
  }

  getFoodEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.foodService.getFoodEntries(
        req.user!.userId,
        req.query.date as string
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createFoodEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await this.foodService.createFromDescription(
        req.user!.userId,
        req.body
      );
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  };

  updateFoodEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await this.foodService.updateFoodEntry(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.json(entry);
    } catch (error) {
      next(error);
    }
  };

  deleteFoodEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.foodService.deleteFoodEntry(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}