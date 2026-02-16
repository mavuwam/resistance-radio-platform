# Error Handling and Logging

This directory contains utilities for error handling and logging in the backend API.

## Logger (`logger.ts`)

Winston-based logging system with multiple transports:

- **Console**: Colored output for development
- **Error log**: `logs/error.log` - Only error-level logs
- **Combined log**: `logs/combined.log` - All logs

### Log Levels

- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages
- `http`: HTTP request logs
- `debug`: Debug messages

### Usage

```typescript
import logger from './utils/logger';

logger.info('Server started');
logger.error('Database connection failed', { error: err });
logger.debug('Processing request', { userId: 123 });
```

## Error Classes (`errors.ts`)

Custom error classes for different HTTP status codes:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `RateLimitError` (429)
- `InternalServerError` (500)
- `ServiceUnavailableError` (503)

### Usage

```typescript
import { NotFoundError, ValidationError } from './utils/errors';

// Throw a not found error
throw new NotFoundError('User not found', 'USER_NOT_FOUND');

// Throw a validation error with details
throw new ValidationError('Invalid input', [
  { field: 'email', message: 'Invalid email format' }
]);
```

## Error Handler Middleware (`errorHandler.ts`)

Centralized error handling middleware that:

- Catches all errors
- Logs errors appropriately
- Sends consistent error responses
- Hides internal errors in production
- Handles 404 routes

### Features

- **Operational vs Programming Errors**: Distinguishes between expected errors (operational) and unexpected errors (programming)
- **Structured Logging**: Logs include request context (URL, method, IP, user ID)
- **Production Safety**: Doesn't expose internal error details in production
- **Async Support**: `asyncHandler` wrapper for async route handlers

### Usage

```typescript
import { asyncHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

// Wrap async route handlers
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
}));
```

## Configuration

Set the `LOG_LEVEL` environment variable to control logging verbosity:

- `error`: Only errors
- `warn`: Warnings and errors
- `info`: Info, warnings, and errors (production default)
- `http`: HTTP requests, info, warnings, and errors
- `debug`: All logs (development default)

Example:
```bash
LOG_LEVEL=info npm start
```
