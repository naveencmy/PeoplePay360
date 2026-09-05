const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Controller
// ─────────────────────────────────────────────────────────────────────────────

async function getKPIs(req, res) {
  const { start_date, end_date } = req.query;
  const kpis = await dashboardService.getKPIs(start_date, end_date);
  sendSuccess(res, kpis);
}

async function getAttendanceHealth(req, res) {
  const { start_date, end_date } = req.query;
  const health = await dashboardService.getAttendanceHealth(start_date, end_date);
  sendSuccess(res, health);
}

async function getSalaryByDepartment(req, res) {
  const { start_date, end_date } = req.query;
  const data = await dashboardService.getSalaryByDepartment(start_date, end_date);
  sendSuccess(res, data);
}

async function getMonthlyTrend(req, res) {
  const months = parseInt(req.query.months) || 12;
  const trend = await dashboardService.getMonthlyTrend(months);
  sendSuccess(res, trend);
}

async function refreshCache(req, res) {
  const result = await dashboardService.refreshDashboardCache();
  sendSuccess(res, result);
}

module.exports = { getKPIs, getAttendanceHealth, getSalaryByDepartment, getMonthlyTrend, refreshCache };
