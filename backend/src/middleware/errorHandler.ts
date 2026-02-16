import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Error handler middleware
 * Catches all errors and sends appropriate responses
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error values
  let statusCode = 500;
  let code = 'SERVER_ERROR';
  let message = 'Internal server error';
  let errors: any[] | undefined;

  // Check if it's an operational error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    
    // Include validation errors if present
    if ('errors' in err) {
      errors = (err as any).errors;
    }

    // Log operational errors at appropriate level
    if (statusCode >= 500) {
      logger.error(`${code}: ${message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: (req as any).user?.userId
      });
    } else {
      logger.warn(`${code}: ${message}`, {
        url: req.url,
        method: req.method,
        ip: req.ip
      });
    }
  } else {
    // Log unexpected errors
    logger.error('Unexpected error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.userId
    });
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Send error response
  const response: any = {
    error: {
      message,
      code
    }
  };

  // Include validation errors if present
  if (errors) {
    response.error.errors = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 * Catches all unmatched routes
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.url
    }
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Unhandled rejection handler
 */
export function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack
    });
    
    // In production, you might want to exit the process
    // and let a process manager restart it
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}

/**
 * Uncaught exception handler
 */
export function handleUncaughtException() {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });
    
    // Exit the process - uncaught exceptions are serious
    process.exit(1);
  });
}
