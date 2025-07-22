import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth/auth.service';
import { MESSAGES } from '@/config/constants';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      
      res.status(201).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      
      res.json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.logout(req.user!.userId);
      
      res.json({
        message: MESSAGES.AUTH.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}