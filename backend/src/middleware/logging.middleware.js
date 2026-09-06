const { v4: uuidv4 } = require('uuid');
const { sanitizeLogPayload } = require('../utils/masking.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Enterprise Structured JSON Request Logging Middleware
// Features: Correlation ID propagation, ISO timestamps, PII masking, latency tracking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attaches a unique correlation ID to every request for tracing
 * Also logs request start/end with durationMs and sanitized data
 */
function requestLogger(req, res, next) {
  // Attach correlation ID (use existing header if provided, or generate new)
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);

  const start = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode || 200;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    const structuredLog = {
      timestamp: new Date().toISOString(),
      level,
      correlationId: req.correlationId,
      userId: req.user?.userId || req.user?.id || 'anonymous',
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Include sanitized request metadata if present and applicable
    if (req.body && Object.keys(req.body).length > 0) {
      structuredLog.body = sanitizeLogPayload(req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
      structuredLog.query = sanitizeLogPayload(req.query);
    }

    const logJson = JSON.stringify(structuredLog);

    if (level === 'error') {
      console.error(logJson);
    } else if (level === 'warn') {
      console.warn(logJson);
    } else if (process.env.NODE_ENV !== 'test') {
      console.log(logJson);
    }
  });

  next();
}

module.exports = { requestLogger };
