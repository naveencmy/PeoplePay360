const timeoffRepo = require('../repositories/timeoff.repository');
const employeeRepo = require('../repositories/employee.repository');
const { AppError } = require('../middleware/error.middleware');
const { getCalendarDays } = require('../utils/date.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Time Off Service — requests, approval, balance tracking
// ─────────────────────────────────────────────────────────────────────────────

// Default annual leave entitlements
const LEAVE_ENTITLEMENTS = {
  CASUAL: 12,
  SICK: 12,
  EARNED: 15,
  MATERNITY: 182,
  PATERNITY: 15,
  UNPAID: 365,
  COMP_OFF: 0,
};

/**
 * Create a time off request
 */
async function requestTimeOff(data) {
  const employee = await employeeRepo.findById(data.employee_id);
  if (!employee) {
    throw AppError.notFound('Employee');
  }

  // Validate dates
  if (new Date(data.date_from) > new Date(data.date_to)) {
    throw AppError.badRequest('Start date cannot be after end date');
  }

  // Check for overlapping requests
  const hasOverlap = await timeoffRepo.hasOverlap(data.employee_id, data.date_from, data.date_to);
  if (hasOverlap) {
    throw AppError.conflict('You already have a leave request for this period');
  }

  // Check balance
  const year = new Date(data.date_from).getFullYear();
  const balance = await getBalance(data.employee_id, year);
  const typeBalance = balance.find((b) => b.leave_type === data.leave_type);

  if (typeBalance && typeBalance.remaining < data.duration && data.leave_type !== 'UNPAID') {
    throw AppError.badRequest(
      `Insufficient ${data.leave_type} leave balance. Available: ${typeBalance.remaining} days, Requested: ${data.duration} days`
    );
  }

  const request = await timeoffRepo.create({
    ...data,
    status: 'PENDING',
  });

  return request;
}

/**
 * Approve a time off request
 */
async function approveTimeOff(requestId, approverId) {
  const request = await timeoffRepo.findById(requestId);
  if (!request) {
    throw AppError.notFound('Time off request');
  }

  if (request.status !== 'PENDING') {
    throw AppError.badRequest(`Cannot approve a request with status: ${request.status}`);
  }

  const updated = await timeoffRepo.update(requestId, {
    status: 'APPROVED',
    approved_by: approverId,
  });

  return updated;
}

/**
 * Reject a time off request
 */
async function rejectTimeOff(requestId, approverId, reason = null) {
  const request = await timeoffRepo.findById(requestId);
  if (!request) {
    throw AppError.notFound('Time off request');
  }

  if (request.status !== 'PENDING') {
    throw AppError.badRequest(`Cannot reject a request with status: ${request.status}`);
  }

  const updated = await timeoffRepo.update(requestId, {
    status: 'REJECTED',
    approved_by: approverId,
    rejection_reason: reason,
  });

  return updated;
}

/**
 * Cancel a time off request (by the employee)
 */
async function cancelTimeOff(requestId, employeeId) {
  const request = await timeoffRepo.findById(requestId);
  if (!request) {
    throw AppError.notFound('Time off request');
  }

  if (request.employee_id !== employeeId) {
    throw AppError.forbidden('You can only cancel your own requests');
  }

  if (!['PENDING', 'APPROVED'].includes(request.status)) {
    throw AppError.badRequest(`Cannot cancel a request with status: ${request.status}`);
  }

  return timeoffRepo.update(requestId, { status: 'CANCELLED' });
}

/**
 * Get leave balance for an employee
 */
async function getBalance(employeeId, year = null) {
  const targetYear = year || new Date().getFullYear();
  const usedLeaves = await timeoffRepo.getUsedLeaveByType(employeeId, targetYear);

  const balance = Object.entries(LEAVE_ENTITLEMENTS).map(([type, entitlement]) => {
    const used = usedLeaves.find((u) => u.leave_type === type);
    const usedDays = used ? parseFloat(used.used_days) : 0;
    return {
      leave_type: type,
      entitlement,
      used: usedDays,
      remaining: Math.max(0, entitlement - usedDays),
    };
  });

  return balance;
}

/**
 * Get approved days for payslip computation
 */
async function getApprovedDays(employeeId, periodStart, periodEnd) {
  return timeoffRepo.getApprovedDays(employeeId, periodStart, periodEnd);
}

/**
 * Get time off requests for an employee
 */
async function getEmployeeRequests(employeeId, queryParams = {}) {
  return timeoffRepo.listAll(employeeId, queryParams.status);
}

/**
 * Get pending requests for a manager's team
 */
async function getPendingForManager(managerId) {
  return timeoffRepo.getPendingForManager(managerId);
}

module.exports = {
  requestTimeOff,
  approveTimeOff,
  rejectTimeOff,
  cancelTimeOff,
  getBalance,
  getApprovedDays,
  getEmployeeRequests,
  getPendingForManager,
  LEAVE_ENTITLEMENTS,
};
