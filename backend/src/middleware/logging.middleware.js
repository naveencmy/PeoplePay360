const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────────────
// Request Logging Middleware — correlation ID + structured logging
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attaches a unique correlation ID to every request for tracing
 * Also logs request start/end with timing
 */
function requestLogger(req, res, next) {
  // Attach correlation ID (use existing header if provided, or generate new)
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);

  const start = Date.now();

  // Log request start
  const logEntry = {
    correlationId: req.correlationId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId || 'anonymous',
  };

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    const completedLog = {
      ...logEntry,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      level,
    };

    if (level === 'error') {
      console.error('📊 Request:', JSON.stringify(completedLog));
    } else if (level === 'warn') {
      console.warn('📊 Request:', JSON.stringify(completedLog));
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📊 Request:', JSON.stringify(completedLog));
    }
  });

  next();
}

module.exports = { requestLogger };
