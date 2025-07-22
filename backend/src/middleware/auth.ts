import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import { AuthenticationError } from '@/utils/errors/app-errors';
import { JWTPayload } from '@/types/models';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const payload = verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        next(new AuthenticationError('Token expired'));
      } else if (error.message === 'Invalid token') {
        next(new AuthenticationError('Invalid token'));
      } else {
        next(new AuthenticationError());
      }
    } else {
      next(new AuthenticationError());
    }
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
}