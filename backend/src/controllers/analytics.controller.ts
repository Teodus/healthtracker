import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '@/services/analytics.service';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDailySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await this.analyticsService.getDailySummary(
        req.user!.userId,
        req.query.date as string
      );
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  getStreakData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 365;
      
      const streakData = await this.analyticsService.getStreakData(
        req.user!.userId,
        days
      );
      
      res.json(streakData);
    } catch (error) {
      next(error);
    }
  };
}