const { Router } = require('express');
const { query } = require('../config/database');
const { checkHealth } = require('../config/redis');
const { getContentType, getMetrics } = require('../config/metrics');

// ─────────────────────────────────────────────────────────────────────────────
// Router Composition — mounts all route modules under /api
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.use('/auth', require('./routes/auth.routes'));
router.use('/employees', require('./routes/employee.routes'));
router.use('/contracts', require('./routes/contract.routes'));
router.use('/attendance', require('./routes/attendance.routes'));
router.use('/timeoff', require('./routes/timeoff.routes'));
router.use('/salary', require('./routes/salary.routes'));
router.use('/payruns', require('./routes/payrun.routes'));
router.use('/payslips', require('./routes/payslip.routes'));
router.use('/dashboard', require('./routes/dashboard.routes'));
router.use('/schedules', require('./routes/schedule.routes'));
router.use('/docs', require('./routes/docs.routes'));

// ═══ LIVENESS HEALTH CHECK ═══
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'peoplepay360-api',
    version: '1.0.0',
  });
});

// ═══ READINESS HEALTH CHECK ═══
router.get('/ready', async (_req, res) => {
  const start = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;
  let redisStatus = 'healthy';
  let redisLatencyMs = 0;
  let isHealthy = true;

  try {
    const dbStart = Date.now();
    await query('SELECT 1');
    dbLatencyMs = Date.now() - dbStart;
  } catch (_err) {
    dbStatus = 'down';
    isHealthy = false;
  }

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
});

// ═══ PROMETHEUS METRICS ═══
router.get('/metrics', async (_req, res) => {
  try {
    res.setHeader('Content-Type', getContentType());
    res.send(await getMetrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
