import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled error:', err);

  // Don't expose internal errors to clients
  const publicError = {
    message: 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    status: err.status || 500
  };

  if (process.env.NODE_ENV === 'development') {
    publicError.stack = err.stack;
  }

  res.status(publicError.status).json(publicError);
}