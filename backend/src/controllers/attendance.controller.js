const attendanceService = require('../services/attendance.service');
const userRepo = require('../repositories/user.repository');
const { sendSuccess, sendCreated } = require('../utils/response.utils');
const { AppError } = require('../middleware/error.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Controller
// ─────────────────────────────────────────────────────────────────────────────

async function resolveEmployeeId(req) {
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
  const summary = await attendanceService.getAttendanceSummary(
    req.query.employee_id, req.query.start_date, req.query.end_date
  );
  sendSuccess(res, summary);
}

async function getRecords(req, res) {
  const employeeId = req.params.id || req.query.employee_id;
  const records = await attendanceService.getAttendanceRecords(
    employeeId, req.query.start_date, req.query.end_date
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
