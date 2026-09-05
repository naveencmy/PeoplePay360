const boss = require('./queue');

// ─────────────────────────────────────────────────────────────────────────────
// C.6 SCHEDULED JOBS (Cron — pg-boss managed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize all recurring cron schedules
 */
async function initializeScheduler() {
  try {
    // 1. Monthly payroll auto-compute (1st of every month at 9 AM)
    await boss.schedule('monthly-payroll', '0 9 1 * *', {
      autoCompute: true,
    });

    // 2. Daily audit log cleanup (2 AM daily)
    await boss.schedule('audit-cleanup', '0 2 * * *', {});

    // 3. Weekly compliance report (Monday 9 AM)
    await boss.schedule('weekly-compliance', '0 9 * * 1', {});

    console.log('📅 pg-boss cron schedules registered (monthly-payroll, audit-cleanup, weekly-compliance)');
  } catch (error) {
    console.warn('⚠️ Could not register pg-boss schedules (DB connection required):', error.message);
  }
}

module.exports = { initializeScheduler };
