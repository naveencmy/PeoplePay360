const payslipRepo = require('../repositories/payslip.repository');
const employeeRepo = require('../repositories/employee.repository');
const attendanceRepo = require('../repositories/attendance.repository');
const timeoffRepo = require('../repositories/timeoff.repository');
const { setCache, getCache, invalidateCache } = require('../config/redis');
const { getWorkingDays, getMonthRange, formatDate } = require('../utils/date.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Service — KPI aggregation with Redis caching
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'dashboard';

/**
 * Get all dashboard KPIs for a period
 * Cached with 5-minute TTL
 */
async function getKPIs(periodStart, periodEnd) {
  const cacheKey = `${CACHE_PREFIX}:kpis:${periodStart}:${periodEnd}`;

  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Compute KPIs
  const [payslipSummary, employeeStats, timeoffSummary] = await Promise.all([
    payslipRepo.getSummaryForPeriod(periodStart, periodEnd),
    employeeRepo.countByStatus(),
    timeoffRepo.getTotalApprovedForPeriod(periodStart, periodEnd),
  ]);

  const kpis = {
    total_net_paid: parseFloat(payslipSummary.total_net_paid) || 0,
    payslips_generated: parseInt(payslipSummary.total_payslips) || 0,
    payslips_paid: parseInt(payslipSummary.paid_count) || 0,
    average_salary: parseFloat(payslipSummary.avg_salary) || 0,
    approved_timeoff_days: parseFloat(timeoffSummary.total_days) || 0,
    timeoff_requests: parseInt(timeoffSummary.request_count) || 0,
    employees: employeeStats.reduce((acc, s) => {
      acc[s.status.toLowerCase()] = parseInt(s.count);
      return acc;
    }, {}),
    total_employees: employeeStats.reduce((sum, s) => sum + parseInt(s.count), 0),
    period: { start: periodStart, end: periodEnd },
  };

  await setCache(cacheKey, kpis, CACHE_TTL);
  return kpis;
}

/**
 * Get attendance health metrics
 */
async function getAttendanceHealth(periodStart, periodEnd) {
  const cacheKey = `${CACHE_PREFIX}:attendance:${periodStart}:${periodEnd}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const anomalies = await attendanceRepo.getAnomalies(periodStart, periodEnd, 50);
  const totalWorkingDays = getWorkingDays(periodStart, periodEnd);

  const health = {
    total_working_days: totalWorkingDays,
    anomalies_count: anomalies.length,
    anomalies: anomalies.map((a) => ({
      employee_id: a.id,
      name: `${a.first_name} ${a.last_name}`,
      department: a.department,
      present_days: parseInt(a.present_days),
      total_days: parseInt(a.total_days),
      attendance_percentage: parseFloat(a.attendance_pct),
    })),
  };

  await setCache(cacheKey, health, CACHE_TTL);
  return health;
}

/**
 * Get salary breakdown by department
 */
async function getSalaryByDepartment(periodStart, periodEnd) {
  const cacheKey = `${CACHE_PREFIX}:dept:${periodStart}:${periodEnd}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const data = await payslipRepo.getSalaryByDepartment(periodStart, periodEnd);

  const result = data.map((d) => ({
    department: d.department || 'Unassigned',
    employee_count: parseInt(d.employee_count),
    total_net: parseFloat(d.total_net),
    average_net: parseFloat(d.avg_net),
  }));

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

/**
 * Get monthly salary trend (last N months)
 */
async function getMonthlyTrend(months = 12) {
  const cacheKey = `${CACHE_PREFIX}:trend:${months}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const data = await payslipRepo.getMonthlyTrend(months);

  const trend = data.map((d) => ({
    month: d.month,
    payslip_count: parseInt(d.payslip_count),
    total_net: parseFloat(d.total_net),
    average_net: parseFloat(d.avg_net),
  }));

  await setCache(cacheKey, trend, CACHE_TTL);
  return trend;
}

/**
 * Force refresh all dashboard caches
 */
async function refreshDashboardCache() {
  await invalidateCache(`${CACHE_PREFIX}:*`);
  return { message: 'Dashboard cache invalidated' };
}

module.exports = {
  getKPIs,
  getAttendanceHealth,
  getSalaryByDepartment,
  getMonthlyTrend,
  refreshDashboardCache,
};
