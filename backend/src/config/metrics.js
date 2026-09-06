const client = require('prom-client');
const { getPool } = require('./database');

// ─────────────────────────────────────────────────────────────────────────────
// Prometheus Metrics Harness (prom-client) — Production-Grade RED Metrics
// ─────────────────────────────────────────────────────────────────────────────

const register = new client.Registry();

// Collect NodeJS standard runtime metrics (Event loop, GC, heap, CPU)
client.collectDefaultMetrics({
  register,
  prefix: 'peoplepay360_',
});

// ═══ RED METRICS ═══

/**
 * HTTP Request Duration Histogram (Latency / Duration)
 */
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/**
 * HTTP Requests Counter (Rate & Errors)
 */
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Payroll Engine Compute Duration Histogram
 */
const payrollComputeDurationSeconds = new client.Histogram({
  name: 'payroll_compute_duration_seconds',
  help: 'Payroll payrun computation duration in seconds',
  labelNames: ['structure_id', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// ═══ DATABASE CONNECTION POOL GAUGES ═══

const dbPoolActiveConnections = new client.Gauge({
  name: 'db_pool_active_connections',
  help: 'Number of active PostgreSQL client connections currently executing queries',
  registers: [register],
  collect() {
    try {
      const pool = getPool();
      if (pool) {
        this.set(Math.max(0, pool.totalCount - pool.idleCount));
      }
    } catch (_err) {
      // Avoid throwing in metric collection
    }
  },
});

const dbPoolIdleConnections = new client.Gauge({
  name: 'db_pool_idle_connections',
  help: 'Number of idle PostgreSQL client connections in the pool',
  registers: [register],
  collect() {
    try {
      const pool = getPool();
      if (pool) {
        this.set(pool.idleCount);
      }
    } catch (_err) {
      // Avoid throwing in metric collection
    }
  },
});

const dbPoolWaitingClients = new client.Gauge({
  name: 'db_pool_waiting_clients',
  help: 'Number of queued requests waiting for a PostgreSQL client connection',
  registers: [register],
  collect() {
    try {
      const pool = getPool();
      if (pool) {
        this.set(pool.waitingCount);
      }
    } catch (_err) {
      // Avoid throwing in metric collection
    }
  },
});

const dbPoolTotalConnections = new client.Gauge({
  name: 'db_pool_total_connections',
  help: 'Total number of PostgreSQL connections allocated in the pool',
  registers: [register],
  collect() {
    try {
      const pool = getPool();
      if (pool) {
        this.set(pool.totalCount);
      }
    } catch (_err) {
      // Avoid throwing in metric collection
    }
  },
});

module.exports = {
  register,
  httpRequestDurationSeconds,
  httpRequestsTotal,
  payrollComputeDurationSeconds,
  dbPoolActiveConnections,
  dbPoolIdleConnections,
  dbPoolWaitingClients,
  dbPoolTotalConnections,
  getContentType: () => register.contentType,
  getMetrics: () => register.metrics(),
};
