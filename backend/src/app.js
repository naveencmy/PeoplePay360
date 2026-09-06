require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { loadEnv } = require('./config/env');
const { query, closePool } = require('./config/database');
const { closeRedis, checkHealth } = require('./config/redis');
const { closeAllQueues } = require('./config/queue');
const { getContentType, getMetrics } = require('./config/metrics');
const apiRoutes = require('./api');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { createGeneralLimiter } = require('./middleware/rateLimit.middleware');
const { requestLogger } = require('./middleware/logging.middleware');
const { auditMiddleware } = require('./middleware/audit.middleware');
const { metricsMiddleware } = require('./middleware/metrics.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Express Application Setup — Production-grade N-layer architecture
// ─────────────────────────────────────────────────────────────────────────────

const env = loadEnv();
const app = express();

// ═══ SECURITY MIDDLEWARE ═══
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  credentials: true,
}));

// ═══ PARSING MIDDLEWARE ═══
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ═══ OBSERVABILITY: RED METRICS & LOGGING ═══
app.use(metricsMiddleware);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ═══ CROSS-CUTTING MIDDLEWARE ═══
app.use(requestLogger);
app.use(auditMiddleware);

// ═══ PROMETHEUS METRICS ENDPOINT (Root & API) ═══
const metricsHandler = async (_req, res) => {
  try {
    res.setHeader('Content-Type', getContentType());
    res.send(await getMetrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
};
app.get('/metrics', metricsHandler);

// ═══ LIVENESS HEALTH CHECK (Process responsiveness, zero external deps) ═══
const livenessHandler = (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'peoplepay360-api',
    version: '1.0.0',
  });
};
app.get('/health', livenessHandler);

// ═══ READINESS HEALTH CHECK (PostgreSQL & Redis connectivity probe) ═══
const readinessHandler = async (_req, res) => {
  const start = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;
  let redisStatus = 'healthy';
  let redisLatencyMs = 0;
  let isHealthy = true;

  // 1. Probe PostgreSQL Pool
  try {
    const dbStart = Date.now();
    await query('SELECT 1');
    dbLatencyMs = Date.now() - dbStart;
  } catch (_err) {
    dbStatus = 'down';
    isHealthy = false;
  }

  // 2. Probe Redis Cache
  try {
    const redisCheck = await checkHealth();
    redisStatus = redisCheck.status;
    redisLatencyMs = redisCheck.latencyMs;
  } catch (_err) {
    redisStatus = 'unavailable';
  }

  const statusCode = isHealthy ? 200 : 503;
  return res.status(statusCode).json({
    status: isHealthy ? 'ready' : 'unhealthy',
    timestamp: new Date().toISOString(),
    totalDurationMs: Date.now() - start,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      redis: {
        status: redisStatus,
        latencyMs: redisLatencyMs,
      },
    },
  });
};
app.get('/ready', readinessHandler);

// ═══ RATE LIMITING ═══
if (env.NODE_ENV !== 'test') {
  app.use('/api', createGeneralLimiter());
}

// ═══ API ROUTES ═══
app.use('/api', apiRoutes);

// ═══ ROOT ROUTE ═══
app.get('/', (_req, res) => {
  res.json({
    name: 'PeoplePay360 API',
    version: '1.0.0',
    description: 'Production-grade Payroll Management System',
    health: '/health',
    readiness: '/ready',
    metrics: '/metrics',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      contracts: '/api/contracts',
      attendance: '/api/attendance',
      timeoff: '/api/timeoff',
      salary: '/api/salary',
      payruns: '/api/payruns',
      payslips: '/api/payslips',
      dashboard: '/api/dashboard',
    },
  });
});

// ═══ ERROR HANDLING ═══
app.use(notFoundHandler);
app.use(errorHandler);

// ═══ GRACEFUL SHUTDOWN ═══
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    await closePool();
    await closeRedis();
    await closeAllQueues();
    console.log('All connections closed. Goodbye!');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// ═══ START SERVER ═══
if (require.main === module) {
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  PeoplePay360 API Server                  ║
║───────────────────────────────────────────────────────────║
║   Running on:     http://localhost:${PORT}                   ║
║   Environment:    ${env.NODE_ENV.padEnd(33)}       ║
║   Database:       ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME.substring(0, 16).padEnd(20)}     ║
║   Redis:          ${env.REDIS_HOST}:${String(env.REDIS_PORT).padEnd(24)}      ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
