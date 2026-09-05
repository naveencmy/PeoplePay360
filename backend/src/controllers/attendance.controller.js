const attendanceService = require('../services/attendance.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Controller
// ─────────────────────────────────────────────────────────────────────────────

async function checkIn(req, res) {
  const record = await attendanceService.checkIn(req.body);
  sendCreated(res, record, 'Checked in successfully');
}

async function checkOut(req, res) {
  const record = await attendanceService.checkOut(req.body);
  sendSuccess(res, record, 'Checked out successfully');
}

async function getSummary(req, res) {
  const summary = await attendanceService.getAttendanceSummary(
    req.query.employee_id, req.query.start_date, req.query.end_date
  );
  sendSuccess(res, summary);
}

async function getRecords(req, res) {
  const records = await attendanceService.getAttendanceRecords(
    req.params.id, req.query.start_date, req.query.end_date
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

module.exports = { checkIn, checkOut, getSummary, getRecords, bulkImport, getAnomalies };
