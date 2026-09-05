const timeoffService = require('../services/timeoff.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Time Off Controller
// ─────────────────────────────────────────────────────────────────────────────

async function requestTimeOff(req, res) {
  const request = await timeoffService.requestTimeOff(req.body);
  await req.audit({ entityType: 'TIMEOFF', entityId: request.id, action: 'REQUESTED', newState: 'PENDING' });
  sendCreated(res, request, 'Time off request submitted');
}

async function approveTimeOff(req, res) {
  const request = await timeoffService.approveTimeOff(req.params.id, req.user.userId);
  await req.audit({
    entityType: 'TIMEOFF', entityId: req.params.id,
    action: 'APPROVED', oldState: 'PENDING', newState: 'APPROVED',
  });
  sendSuccess(res, request, 'Request approved');
}

async function rejectTimeOff(req, res) {
  const request = await timeoffService.rejectTimeOff(req.params.id, req.user.userId, req.body.reason);
  await req.audit({
    entityType: 'TIMEOFF', entityId: req.params.id,
    action: 'REJECTED', oldState: 'PENDING', newState: 'REJECTED',
  });
  sendSuccess(res, request, 'Request rejected');
}

async function cancelTimeOff(req, res) {
  const request = await timeoffService.cancelTimeOff(req.params.id, req.user.userId);
  await req.audit({ entityType: 'TIMEOFF', entityId: req.params.id, action: 'CANCELLED' });
  sendSuccess(res, request, 'Request cancelled');
}

async function getBalance(req, res) {
  const balance = await timeoffService.getBalance(req.params.id || req.user.userId, req.query.year);
  sendSuccess(res, balance);
}

async function listRequests(req, res) {
  const employeeId = req.query.employee_id || (req.user.role === 'EMPLOYEE' ? req.user.userId : null);
  const result = await timeoffService.getEmployeeRequests(employeeId, req.query);
  sendSuccess(res, result, 'Requests retrieved', 200);
}

async function getPending(req, res) {
  const requests = await timeoffService.getPendingForManager(req.user.userId);
  sendSuccess(res, requests);
}

module.exports = { requestTimeOff, approveTimeOff, rejectTimeOff, cancelTimeOff, getBalance, listRequests, getPending };
