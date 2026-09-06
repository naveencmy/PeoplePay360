const attendanceService = require('../services/attendance.service');
const userRepo = require('../repositories/user.repository');
const { sendSuccess, sendCreated } = require('../utils/response.utils');
const { AppError } = require('../middleware/error.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Controller
// ─────────────────────────────────────────────────────────────────────────────

async function resolveEmployeeId(req) {
  // If role is EMPLOYEE, always force their own employee ID, never allow spoofing!
  if (req.user?.role === 'EMPLOYEE') {
    if (req.user.employeeId) return req.user.employeeId;
    if (req.user.userId) {
      const user = await userRepo.findById(req.user.userId);
      if (user?.employee_id) return user.employee_id;
    }
    return null;
  }

  // For ADMIN / HR / MANAGER, allow employee_id query / body parameter
  let employeeId = req.body?.employee_id || req.query?.employee_id;
  if (typeof employeeId === 'string' && employeeId.trim()) {
    return employeeId.trim();
  }
  if (req.user?.employeeId) {
    return req.user.employeeId;
  }
  if (req.user?.userId) {
    const user = await userRepo.findById(req.user.userId);
    if (user?.employee_id) return user.employee_id;
  }
  return null;
}

async function checkIn(req, res) {
  const employeeId = await resolveEmployeeId(req);
  if (!employeeId) {
    throw AppError.badRequest('Employee ID is required for check-in');
  }

  const rawTime = req.body.check_in || req.body.time || req.body.timestamp;
  const check_in = rawTime ? (rawTime instanceof Date ? rawTime.toISOString() : String(rawTime)) : new Date().toISOString();

  const record = await attendanceService.checkIn({
    employee_id: employeeId,
    check_in,
    notes: req.body.notes,
  });
  sendCreated(res, record, 'Checked in successfully');
}

async function checkOut(req, res) {
  const employeeId = await resolveEmployeeId(req);
  if (!employeeId) {
    throw AppError.badRequest('Employee ID is required for check-out');
  }

  const rawTime = req.body.check_out || req.body.time || req.body.timestamp;
  const check_out = rawTime ? (rawTime instanceof Date ? rawTime.toISOString() : String(rawTime)) : new Date().toISOString();

  const record = await attendanceService.checkOut({
    employee_id: employeeId,
    check_out,
    notes: req.body.notes,
  });
  sendSuccess(res, record, 'Checked out successfully');
}

async function getTodayStatus(req, res) {
  const employeeId = await resolveEmployeeId(req);
  if (!employeeId) {
    return sendSuccess(res, { isCheckedIn: false, openRecord: null, todayRecord: null, isCompleted: false });
  }
  const status = await attendanceService.getTodayStatus(employeeId);
  sendSuccess(res, status);
}

async function getSummary(req, res) {
  let employeeId = req.query.employee_id;
  if (req.user.role === 'EMPLOYEE') {
    employeeId = await resolveEmployeeId(req);
  }
  const summary = await attendanceService.getAttendanceSummary(
    employeeId, req.query.start_date, req.query.end_date
  );
  sendSuccess(res, summary);
}

async function getRecords(req, res) {
  let employeeId = req.params.id || req.query.employee_id;
  if (req.user.role === 'EMPLOYEE') {
    const userEmpId = await resolveEmployeeId(req);
    employeeId = userEmpId; // Force self-only
  }
  const startDate = req.query.start_date || req.query.dateFrom;
  const endDate = req.query.end_date || req.query.dateTo;
  const search = req.user.role === 'EMPLOYEE' ? null : (req.query.search || req.query.employeeSearch);
  const status = req.query.status;
  const records = await attendanceService.getAttendanceRecords(
    employeeId, startDate, endDate, search, status
  );
  sendSuccess(res, records);
}

async function bulkImport(req, res) {
  const records = await attendanceService.bulkImport(req.body.records);
  sendCreated(res, records, `${records.length} attendance records imported`);
}

async function getAnomalies(req, res) {
  const anomalies = await attendanceService.getAnomalies(
    req.query.start_date, req.query.end_date, req.query.threshold
  );
  sendSuccess(res, anomalies);
}

module.exports = { checkIn, checkOut, getTodayStatus, getSummary, getRecords, bulkImport, getAnomalies };
