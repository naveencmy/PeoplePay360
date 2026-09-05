const { Router } = require('express');

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

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PeoplePay360 API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;
