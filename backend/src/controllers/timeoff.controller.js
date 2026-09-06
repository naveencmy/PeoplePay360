const timeoffService = require('../services/timeoff.service');
const timeoffRepo = require('../repositories/timeoff.repository');
const userRepo = require('../repositories/user.repository');
const { sendSuccess, sendCreated } = require('../utils/response.utils');
const { AppError } = require('../middleware/error.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Time Off Controller
// ─────────────────────────────────────────────────────────────────────────────

async function resolveEmployeeId(req) {
  if (req.user?.employeeId) return req.user.employeeId;
  if (req.user?.userId) {
    const user = await userRepo.findById(req.user.userId);
    if (user?.employee_id) return user.employee_id;
  }
  return null;
}

async function requestTimeOff(req, res) {
  if (req.user.role === 'EMPLOYEE') {
    const userEmpId = await resolveEmployeeId(req);
    if (!userEmpId) {
      throw AppError.badRequest('No employee profile linked to this account');
    }
    if (req.body.employee_id && req.body.employee_id !== userEmpId) {
      throw AppError.forbidden('You are not authorized to submit leave requests for other employees');
    }
    req.body.employee_id = userEmpId;
  }

  const request = await timeoffService.requestTimeOff(req.body);
  await req.audit({ entityType: 'TIMEOFF', entityId: request.id, action: 'REQUESTED', newState: 'PENDING' });
  sendCreated(res, request, 'Time off request submitted');
}

async function approveTimeOff(req, res) {
  if (req.user.role === 'MANAGER') {
    const managerEmpId = await resolveEmployeeId(req);
    const request = await timeoffRepo.findById(req.params.id);
    if (!request) throw AppError.notFound('Time off request');

    const emp = await timeoffRepo.raw(
      'SELECT manager_id FROM employees WHERE id = $1',
      [request.employee_id]
    );
    if (!emp.rows[0] || emp.rows[0].manager_id !== managerEmpId) {
      throw AppError.forbidden('You can only approve leave requests for your direct reports');
    }
  }

  const request = await timeoffService.approveTimeOff(req.params.id, req.user.userId);
  await req.audit({
    entityType: 'TIMEOFF', entityId: req.params.id,
    action: 'APPROVED', oldState: 'PENDING', newState: 'APPROVED',
  });
  sendSuccess(res, request, 'Request approved');
}

async function rejectTimeOff(req, res) {
  if (req.user.role === 'MANAGER') {
    const managerEmpId = await resolveEmployeeId(req);
    const request = await timeoffRepo.findById(req.params.id);
    if (!request) throw AppError.notFound('Time off request');

    const emp = await timeoffRepo.raw(
      'SELECT manager_id FROM employees WHERE id = $1',
      [request.employee_id]
    );
    if (!emp.rows[0] || emp.rows[0].manager_id !== managerEmpId) {
      throw AppError.forbidden('You can only reject leave requests for your direct reports');
    }
  }

  const request = await timeoffService.rejectTimeOff(req.params.id, req.user.userId, req.body.reason);
  await req.audit({
    entityType: 'TIMEOFF', entityId: req.params.id,
    action: 'REJECTED', oldState: 'PENDING', newState: 'REJECTED',
  });
  sendSuccess(res, request, 'Request rejected');
}

async function cancelTimeOff(req, res) {
  let empIdToCancel = null;
  if (req.user.role === 'EMPLOYEE') {
    empIdToCancel = await resolveEmployeeId(req);
    const request = await timeoffRepo.findById(req.params.id);
    if (!request) throw AppError.notFound('Time off request');
    if (request.employee_id !== empIdToCancel) {
      throw AppError.forbidden('You can only cancel your own time off requests');
    }
  } else {
    const request = await timeoffRepo.findById(req.params.id);
    if (!request) throw AppError.notFound('Time off request');
    empIdToCancel = request.employee_id;
  }

  const request = await timeoffService.cancelTimeOff(req.params.id, empIdToCancel);
  await req.audit({ entityType: 'TIMEOFF', entityId: req.params.id, action: 'CANCELLED' });
  sendSuccess(res, request, 'Request cancelled');
}

async function getBalance(req, res) {
  let targetEmpId = req.params.id;
  if (req.user.role === 'EMPLOYEE') {
    const userEmpId = await resolveEmployeeId(req);
    if (targetEmpId && targetEmpId !== userEmpId) {
      throw AppError.forbidden('You are not authorized to view other employees leave balance');
    }
    targetEmpId = userEmpId;
  } else if (!targetEmpId) {
    targetEmpId = await resolveEmployeeId(req);
  }

  if (!targetEmpId) {
    return sendSuccess(res, []);
  }

  const balance = await timeoffService.getBalance(targetEmpId, req.query.year);
  sendSuccess(res, balance);
}

async function listRequests(req, res) {
  let employeeId = req.query.employee_id;
  if (req.user.role === 'EMPLOYEE') {
    employeeId = await resolveEmployeeId(req);
  }
  const result = await timeoffService.getEmployeeRequests(employeeId, req.query);
  sendSuccess(res, result, 'Requests retrieved', 200);
}

async function getPending(req, res) {
  let managerId = null;
  if (req.user.role === 'MANAGER') {
    managerId = await resolveEmployeeId(req);
    if (!managerId) return sendSuccess(res, []);
  }
  const requests = await timeoffService.getPendingForManager(managerId);
  sendSuccess(res, requests);
}

module.exports = { requestTimeOff, approveTimeOff, rejectTimeOff, cancelTimeOff, getBalance, listRequests, getPending };
