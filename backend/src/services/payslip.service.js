const payslipRepo = require('../repositories/payslip.repository');
const { AppError } = require('../middleware/error.middleware');
const { buildPagination } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Payslip Service — CRUD + history + employee access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a single payslip with full employee details
 */
async function getPayslip(id) {
  const payslip = await payslipRepo.getWithEmployee(id);
  if (!payslip) throw AppError.notFound('Payslip');

  // Parse lines if stored as JSON string
  if (typeof payslip.lines === 'string') {
    payslip.lines = JSON.parse(payslip.lines);
  }

  return payslip;
}

/**
 * Get all payslips for a payrun
 */
async function getPayslipsByPayrun(payrunId) {
  const payslips = await payslipRepo.getByPayrun(payrunId);
  return payslips.map((ps) => ({
    ...ps,
    lines: typeof ps.lines === 'string' ? JSON.parse(ps.lines) : ps.lines,
  }));
}

/**
 * Get payslip history for an employee
 */
async function getPayslipsByEmployee(employeeId, queryParams = {}) {
  const { rows, total } = await payslipRepo.getByEmployee(employeeId, queryParams);
  const payslips = rows.map((ps) => ({
    ...ps,
    lines: typeof ps.lines === 'string' ? JSON.parse(ps.lines) : ps.lines,
  }));

  return {
    payslips,
    pagination: buildPagination(queryParams.page || 1, queryParams.limit || 20, total),
  };
}

/**
 * Get payslip summary statistics for a period
 */
async function getPayslipSummary(periodStart, periodEnd) {
  return payslipRepo.getSummaryForPeriod(periodStart, periodEnd);
}

module.exports = {
  getPayslip,
  getPayslipsByPayrun,
  getPayslipsByEmployee,
  getPayslipSummary,
};
