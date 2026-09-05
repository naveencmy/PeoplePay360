const boss = require('./queue');
const { registerWorkers } = require('./workers/payrun.worker');
const { initializeScheduler } = require('./scheduler');
const observability = require('./observability');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: BACKGROUND JOBS — pg-boss (PostgreSQL-backed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize queue, register all workers, and schedule recurring jobs
 */
async function initializeJobs() {
  await boss.startQueue();
  await registerWorkers();
  await initializeScheduler();
  return boss;
}

/**
 * Gracefully stop pg-boss queue
 */
async function stopJobs() {
  await boss.stopQueue();
}

/**
 * Enqueue payrun computation job with singleton lock
 * @param {string} payrunId - Payrun ID
 * @param {string[]} employeeIds - Array of employee IDs to compute
 */
async function enqueuePayrunCompute(payrunId, employeeIds) {
  return boss.send('payrun.compute', {
    payrunId,
    employeeIds,
  }, {
    singletonKey: `payrun-${payrunId}`,
    singletonMinutes: 30, // At most once per 30 minutes
    priority: 1, // High priority
  });
}

/**
 * Enqueue single payslip PDF generation job
 */
async function enqueuePayslipPDF(payslipId, employeeId) {
  return boss.send('payslip.pdf', {
    payslipId,
    employeeId,
  }, {
    retryLimit: 3,
    retryDelay: 30,
  });
}

/**
 * Enqueue single payslip email job
 */
async function enqueuePayslipEmail(payslipId, employeeEmail) {
  return boss.send('payslip.email', {
    payslipId,
    employeeEmail,
  }, {
    retryLimit: 3,
    retryDelay: 60,
  });
}

/**
 * Batch enqueue email jobs for multiple payslips via boss.insert()
 * @param {Array<{payslipId: string, employeeEmail: string}>} payslipItems
 */
async function enqueueBatchPayslipEmails(payslipItems) {
  const jobs = payslipItems.map((p) => ({
    name: 'payslip.email',
    data: {
      payslipId: p.payslipId || p.id,
      employeeEmail: p.employeeEmail || (p.employee && p.employee.email),
    },
    options: {
      retryLimit: 3,
      retryDelay: 60,
    },
  }));

  if (jobs.length === 0) return { queued: 0 };

  await boss.insert(jobs);
  return { queued: jobs.length };
}

/**
 * Enqueue payroll anomaly scan
 */
async function enqueueAnomalyScan(payrunId) {
  return boss.send('payroll.anomaly-scan', {
    payrunId,
  }, {
    priority: 2,
  });
}

module.exports = {
  boss,
  initializeJobs,
  stopJobs,
  enqueuePayrunCompute,
  enqueuePayslipPDF,
  enqueuePayslipEmail,
  enqueueBatchPayslipEmails,
  enqueueAnomalyScan,
  ...observability,
};
