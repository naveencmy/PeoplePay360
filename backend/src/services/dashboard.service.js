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

  let totalNetPaid = parseFloat(payslipSummary.total_net_paid) || 0;
  let avgSalary = parseFloat(payslipSummary.avg_salary) || 0;
  if (totalNetPaid === 0) {
    const contractStats = await payslipRepo.raw(`
      SELECT COALESCE(SUM(wage), 0) AS total, COALESCE(AVG(wage), 0) AS avg, COUNT(*) AS count
      FROM contracts WHERE state = 'ACTIVE' AND deleted_at IS NULL
    `);
    totalNetPaid = parseFloat(contractStats.rows[0]?.total || 0);
    avgSalary = parseFloat(contractStats.rows[0]?.avg || 0);
  }

  const kpis = {
    total_net_paid: totalNetPaid,
    payslips_generated: parseInt(payslipSummary.total_payslips) || 0,
    payslips_paid: parseInt(payslipSummary.paid_count) || 0,
    average_salary: avgSalary,
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

  let data = await payslipRepo.getSalaryByDepartment(periodStart, periodEnd);
  if (!data || data.length === 0) {
    const deptWages = await payslipRepo.raw(`
      SELECT e.department, COUNT(DISTINCT e.id) as employee_count, 
             COALESCE(SUM(c.wage), 0) as total_net, COALESCE(AVG(c.wage), 0) as avg_net
      FROM employees e
      JOIN contracts c ON c.employee_id = e.id AND c.state = 'ACTIVE' AND c.deleted_at IS NULL
      WHERE e.status = 'ACTIVE' AND e.deleted_at IS NULL
      GROUP BY e.department
      ORDER BY total_net DESC
    `);
    data = deptWages.rows;
  }

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
 * Get 7-day attendance trend
 */
async function getAttendanceTrend() {
  const cacheKey = `${CACHE_PREFIX}:attendance_trend`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const result = await attendanceRepo.raw(`
      WITH days AS (
        SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval)::date AS day
      ),
      emp_count AS (
        SELECT COUNT(*) AS total FROM employees WHERE status = 'ACTIVE' AND deleted_at IS NULL
      )
      SELECT 
        TO_CHAR(d.day, 'Dy') AS day,
        d.day AS date,
        COUNT(a.id) FILTER (WHERE a.status = 'PRESENT' OR a.check_in IS NOT NULL) AS present_count,
        COUNT(a.id) FILTER (WHERE a.status = 'LATE') AS late_count,
        COALESCE((SELECT total FROM emp_count), 0) AS total_employees
      FROM days d
      LEFT JOIN attendance a ON a.date = d.day AND a.deleted_at IS NULL
      GROUP BY d.day
      ORDER BY d.day ASC
    `);

    const data = result.rows.map((r) => {
      const total = parseInt(r.total_employees, 10) || 1;
      const present = parseInt(r.present_count, 10) || 0;
      const late = parseInt(r.late_count, 10) || 0;
      const attendancePct = Math.min(100, Math.round((present / total) * 100));
      const latePct = Math.min(100, Math.round((late / total) * 100));

      return {
        day: r.day,
        attendance: attendancePct,
        late: latePct,
      };
    });

    await setCache(cacheKey, data, CACHE_TTL);
    return data;
  } catch (error) {
    console.error('Failed to query attendance trend:', error);
    return [];
  }
}

/**
 * Get time-off summary breakdown
 */
async function getTimeOffSummary() {
  const cacheKey = `${CACHE_PREFIX}:timeoff_summary`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const [statsRes, empCountRes] = await Promise.all([
      timeoffRepo.raw(`
        SELECT 
          leave_type,
          COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved_count,
          COALESCE(SUM(duration) FILTER (WHERE status = 'APPROVED'), 0) AS approved_days,
          COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count,
          COALESCE(SUM(duration) FILTER (WHERE status = 'PENDING'), 0) AS pending_days
        FROM timeoff_requests
        WHERE deleted_at IS NULL
        GROUP BY leave_type
      `),
      employeeRepo.raw(`SELECT COUNT(*) as count FROM employees WHERE status = 'ACTIVE' AND deleted_at IS NULL`),
    ]);

    const activeEmpCount = parseInt(empCountRes.rows[0]?.count, 10) || 0;
    const standardTypes = [
      { key: 'PAID_LEAVE', name: 'Paid Leave', quota: 15 },
      { key: 'SICK_LEAVE', name: 'Sick Leave', quota: 10 },
      { key: 'CASUAL_LEAVE', name: 'Casual Leave', quota: 10 },
    ];

    const statsMap = {};
    for (const row of statsRes.rows) {
      const normalizedKey = (row.leave_type || '').toUpperCase();
      statsMap[normalizedKey] = {
        approved: parseFloat(row.approved_days) || 0,
        pending: parseInt(row.pending_count, 10) || 0,
      };
      if (normalizedKey === 'CASUAL') {
        statsMap['CASUAL_LEAVE'] = {
          approved: (statsMap['CASUAL_LEAVE']?.approved || 0) + (parseFloat(row.approved_days) || 0),
          pending: (statsMap['CASUAL_LEAVE']?.pending || 0) + (parseInt(row.pending_count, 10) || 0),
        };
      }
    }

    let totalApproved = 0;
    let totalPending = 0;
    let totalBalance = 0;

    const breakdown = standardTypes.map((t) => {
      const approved = statsMap[t.key]?.approved || 0;
      const pending = statsMap[t.key]?.pending || 0;
      const balance = Math.max(0, activeEmpCount * t.quota - approved);

      totalApproved += approved;
      totalPending += pending;
      totalBalance += balance;

      return {
        type: t.name,
        approved: Math.round(approved),
        pending,
        balance,
      };
    });

    const result = {
      summary: {
        approved: Math.round(totalApproved),
        pending: totalPending,
        available: `${totalBalance}d`,
      },
      breakdown,
    };

    await setCache(cacheKey, result, CACHE_TTL);
    return result;
  } catch (error) {
    console.error('Failed to query timeoff summary:', error);
    return {
      summary: { approved: 0, pending: 0, available: '0d' },
      breakdown: [],
    };
  }
}

/**
 * Get real-time payroll status counts
 */
async function getPayrollStatusCounts() {
  const cacheKey = `${CACHE_PREFIX}:status_counts`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const [payrunCounts, payslipCounts, warningCounts] = await Promise.all([
      payslipRepo.raw(`
        SELECT state, COUNT(*) as count 
        FROM payruns 
        WHERE deleted_at IS NULL 
        GROUP BY state
      `),
      payslipRepo.raw(`
        SELECT status, COUNT(*) as count 
        FROM payslips 
        WHERE deleted_at IS NULL 
        GROUP BY status
      `),
      attendanceRepo.raw(`
        SELECT COUNT(*) as count 
        FROM attendance 
        WHERE check_out IS NULL AND date < CURRENT_DATE AND deleted_at IS NULL
      `),
    ]);

    const pMap = {};
    for (const r of payrunCounts.rows) pMap[r.state] = parseInt(r.count, 10);
    const sMap = {};
    for (const r of payslipCounts.rows) sMap[r.status] = parseInt(r.count, 10);

    const result = {
      paid: sMap['PAID'] || pMap['PAID'] || 0,
      computed: sMap['COMPUTED'] || pMap['COMPUTED'] || 0,
      draft: pMap['DRAFT'] || 0,
      warnings: parseInt(warningCounts.rows[0]?.count, 10) || 0,
    };

    await setCache(cacheKey, result, CACHE_TTL);
    return result;
  } catch (error) {
    console.error('Failed to query payroll status counts:', error);
    return { paid: 0, computed: 0, draft: 0, warnings: 0 };
  }
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
  getAttendanceTrend,
  getTimeOffSummary,
  getPayrollStatusCounts,
  refreshDashboardCache,
};
