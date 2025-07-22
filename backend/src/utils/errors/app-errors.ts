// Custom error classes for the application

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
      timestamp: new Date().toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export class AIProcessingError extends AppError {
  constructor(message: string, service: 'whisper' | 'claude') {
    super(
      `AI processing failed: ${message}`,
      500,
      `AI_${service.toUpperCase()}_ERROR`
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: any) {
    super(message, 500, 'DATABASE_ERROR', { originalError });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(
      `External service error (${service}): ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR'
    );
  }
}