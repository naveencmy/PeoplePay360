require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { loadEnv } = require('./config/env');
const { closePool } = require('./config/database');
const { closeRedis } = require('./config/redis');
const { closeAllQueues } = require('./config/queue');
const apiRoutes = require('./api');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { createGeneralLimiter } = require('./middleware/rateLimit.middleware');
const { requestLogger } = require('./middleware/logging.middleware');
const { auditMiddleware } = require('./middleware/audit.middleware');

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

// ═══ LOGGING ═══
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ═══ CROSS-CUTTING MIDDLEWARE ═══
app.use(requestLogger);
app.use(auditMiddleware);

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
    documentation: '/api/health',
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
    console.error(' Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error(' Unhandled Rejection:', reason);
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
