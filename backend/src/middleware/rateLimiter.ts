import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '@/config/constants';
import { RateLimitError } from '@/utils/errors/app-errors';

// Create rate limiter factory
function createRateLimiter(options: typeof RATE_LIMITS.AUTH) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next, options) => {
      next(new RateLimitError(`Too many requests. Limit: ${options.max} per ${options.windowMs / 1000} seconds`));
    },
  });
}

// Auth endpoints rate limiter
export const authRateLimiter = createRateLimiter(RATE_LIMITS.AUTH);

// Voice endpoints rate limiter
export const voiceRateLimiter = createRateLimiter(RATE_LIMITS.VOICE);

// Analytics endpoints rate limiter
export const analyticsRateLimiter = createRateLimiter(RATE_LIMITS.ANALYTICS);

// General API rate limiter
export const generalRateLimiter = createRateLimiter(RATE_LIMITS.GENERAL);