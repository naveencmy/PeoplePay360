const { loadEnv } = require('../config/env');

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler — operational vs programming errors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom operational error class
 * Used for expected errors (bad input, not found, conflict, etc.)
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
  }

  static conflict(message) {
    return new AppError(message, 409, 'CONFLICT');
  }

  static unprocessable(message, details = null) {
    return new AppError(message, 422, 'UNPROCESSABLE', details);
  }

  static invalidStateTransition(from, to, entity = 'Entity') {
    return new AppError(
      `Invalid state transition: ${entity} cannot go from ${from} to ${to}`,
      409,
      'INVALID_STATE_TRANSITION'
    );
  }
}

/**
 * Global error handling middleware
 * Must be registered LAST in the middleware chain (after all routes)
 */
function errorHandler(err, req, res, _next) {
  const env = loadEnv();

  // Log the error
  if (err.isOperational) {
    // Operational errors — expected, log at warn level
    if (env.NODE_ENV === 'development') {
      console.warn(`⚠️ [${err.code}] ${err.message}`);
    }
  } else {
    // Programming errors — unexpected, log full stack
    console.error('🔥 Unexpected error:', err);
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build response
  const response = {
    success: false,
    message: err.isOperational ? err.message : 'An unexpected error occurred',
    code: err.code || 'INTERNAL_ERROR',
  };

  // Include details for operational errors
  if (err.isOperational && err.details) {
    response.details = err.details;
  }

  // Include stack trace in development for non-operational errors
  if (env.NODE_ENV === 'development' && !err.isOperational) {
    response.stack = err.stack;
  }

  // Correlation ID if present
  if (req.correlationId) {
    response.correlationId = req.correlationId;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}

module.exports = { AppError, errorHandler, notFoundHandler };
