import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors/app-errors';
import logger from '@/utils/logger';
import { env } from '@/config/env';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): any {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      code: 'CORS_ERROR',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      code: 'INVALID_JSON',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Supabase errors
  if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE',
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const isDevelopment = env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    code: 'SERVER_ERROR',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
}