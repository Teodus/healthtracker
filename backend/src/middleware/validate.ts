import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '@/utils/errors/app-errors';

/**
 * Request validation middleware factory
 */
export function validate(schema: z.ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate request body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Query validation middleware factory
 */
export function validateQuery(schema: z.ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate query parameters without reassigning
      const validated = await schema.parseAsync(req.query);
      // Store validated data on req for controllers to use
      (req as any).validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Query validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Params validation middleware factory
 */
export function validateParams(schema: z.ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate route parameters
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Parameter validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}