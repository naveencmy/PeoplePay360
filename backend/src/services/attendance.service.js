const attendanceRepo = require('../repositories/attendance.repository');
const employeeRepo = require('../repositories/employee.repository');
const { AppError } = require('../middleware/error.middleware');
const { calculateHours, getWorkingDays } = require('../utils/date.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Service — check-in/out, summary, anomaly detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record employee check-in
 */
async function checkIn({ employee_id, check_in, notes }) {
  // Verify employee exists
  const employee = await employeeRepo.findById(employee_id);
  if (!employee) {
    throw AppError.notFound('Employee');
  }

  // Check for existing open check-in
  const openRecord = await attendanceRepo.getOpenCheckIn(employee_id);
  if (openRecord) {
    throw AppError.conflict('Employee already has an open check-in. Please check out first.');
  }

  const checkInTime = check_in || new Date().toISOString();
  const date = checkInTime.split('T')[0];

  const record = await attendanceRepo.create({
    employee_id,
    date,
    check_in: checkInTime,
    worked_hours: 0,
    status: 'PRESENT',
    notes,
  });

  return record;
}

/**
 * Record employee check-out
 */
async function checkOut({ employee_id, check_out, notes }) {
  // Find open check-in
  const openRecord = await attendanceRepo.getOpenCheckIn(employee_id);
  if (!openRecord) {
    throw AppError.badRequest('No open check-in found. Please check in first.');
  }

  const checkOutTime = check_out || new Date().toISOString();
  const workedHours = calculateHours(openRecord.check_in, checkOutTime);

  if (workedHours < 0) {
    throw AppError.badRequest('Check-out time cannot be before check-in time');
  }

  const updated = await attendanceRepo.update(openRecord.id, {
    check_out: checkOutTime,
    worked_hours: workedHours,
    notes: notes || openRecord.notes,
  });

  return updated;
}

/**
 * Get attendance summary for an employee within a period
 */
async function getAttendanceSummary(employeeId, periodStart, periodEnd) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    throw AppError.notFound('Employee');
  }

  const summary = await attendanceRepo.getSummary(employeeId, periodStart, periodEnd);
  const totalWorkingDays = getWorkingDays(periodStart, periodEnd);
  const absentDays = Math.max(0, totalWorkingDays - summary.worked_days);
  const attendancePct = totalWorkingDays > 0
    ? Math.round((summary.worked_days / totalWorkingDays) * 10000) / 100
    : 0;

  return {
    employee_id: employeeId,
    period_start: periodStart,
    period_end: periodEnd,
    worked_days: summary.worked_days,
    total_working_days: totalWorkingDays,
    absent_days: absentDays,
    total_hours: summary.total_hours,
    attendance_percentage: attendancePct,
  };
}

/**
 * Get daily attendance records
 */
async function getAttendanceRecords(employeeId, periodStart, periodEnd, search, status) {
  return attendanceRepo.listAll(employeeId, periodStart, periodEnd, search, status);
}

/**
 * Bulk import attendance records
 */
async function bulkImport(records) {
  // Calculate worked hours for each record
  const processed = records.map((r) => ({
    ...r,
    worked_hours: calculateHours(r.check_in, r.check_out),
  }));

  return attendanceRepo.bulkCreate(processed);
}

/**
 * Get attendance anomalies
 */
async function getAnomalies(periodStart, periodEnd, threshold = 50) {
  const now = new Date();
  const start = periodStart || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = periodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return attendanceRepo.getAnomalies(start, end, threshold);
}

/**
 * Get today's attendance status for an employee
 */
async function getTodayStatus(employeeId) {
  const openRecord = await attendanceRepo.getOpenCheckIn(employeeId);
  const todayRecord = await attendanceRepo.getTodayRecord(employeeId);
  return {
    openRecord,
    todayRecord,
    isCheckedIn: !!openRecord,
    isCompleted: !!todayRecord && !!todayRecord.check_out,
  };
}

module.exports = {
  checkIn,
  checkOut,
  getAttendanceSummary,
  getAttendanceRecords,
  bulkImport,
  getAnomalies,
  getTodayStatus,
};
