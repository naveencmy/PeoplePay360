const { httpRequestDurationSeconds, httpRequestsTotal } = require('../config/metrics');

// ─────────────────────────────────────────────────────────────────────────────
// Prometheus Metrics Middleware — RED Metrics HTTP Interceptor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize path to prevent high-cardinality label explosion
 */
function normalizePath(req) {
  if (req.route && req.route.path) {
    const basePath = req.baseUrl || '';
    const routePath = typeof req.route.path === 'string' ? req.route.path : req.route.path.toString();
    return `${basePath}${routePath}`;
  }

  // Regex fallback: replace UUIDs, numeric IDs, and timestamps with :id
  let path = req.baseUrl ? req.baseUrl + req.path : req.path;
  path = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
  path = path.replace(/\/\d+/g, '/:id');
  return path || '/';
}

function metricsMiddleware(req, res, next) {
  // Ignore Prometheus scraper endpoint itself to avoid recursion
  if (req.path === '/metrics' || req.path === '/api/metrics') {
    return next();
  }

  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const durationInSeconds = elapsedHrTime[0] + elapsedHrTime[1] / 1e9;

    const route = normalizePath(req);
    const method = req.method;
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    try {
      httpRequestDurationSeconds.observe(
        { method, route, status_code: statusCode },
        durationInSeconds
      );

      httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode,
      });
    } catch (_err) {
      // Never allow metrics collection failure to affect response
    }
  });

  next();
}

module.exports = { metricsMiddleware };
