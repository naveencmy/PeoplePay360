const contractService = require('../services/contract.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Contract Controller
// ─────────────────────────────────────────────────────────────────────────────

async function createContract(req, res) {
  const contract = await contractService.createContract(req.body);
  await req.audit({ entityType: 'CONTRACT', entityId: contract.id, action: 'CREATED' });
  sendCreated(res, contract, 'Contract created successfully');
}

async function updateContract(req, res) {
  const contract = await contractService.updateContract(req.params.id, req.body);
  await req.audit({ entityType: 'CONTRACT', entityId: req.params.id, action: 'UPDATED' });
  sendSuccess(res, contract, 'Contract updated');
}

const userRepo = require('../repositories/user.repository');
const { AppError } = require('../middleware/error.middleware');

async function getAuthEmployeeId(req) {
  if (req.user?.employeeId) return req.user.employeeId;
  if (req.user?.userId) {
    const user = await userRepo.findById(req.user.userId);
    if (user?.employee_id) return user.employee_id;
  }
  return null;
}

async function getEmployeeContracts(req, res) {
  if (req.user.role === 'EMPLOYEE') {
    const userEmpId = await getAuthEmployeeId(req);
    if (!userEmpId || req.params.id !== userEmpId) {
      throw AppError.forbidden('You are not authorized to view other employees contracts');
    }
  }
  const contracts = await contractService.getEmployeeContracts(req.params.id);
  sendSuccess(res, contracts);
}

async function getActiveContract(req, res) {
  if (req.user.role === 'EMPLOYEE') {
    const userEmpId = await getAuthEmployeeId(req);
    if (!userEmpId || req.params.id !== userEmpId) {
      throw AppError.forbidden('You are not authorized to view other employees contracts');
    }
  }
  const contract = await contractService.getActiveContract(req.params.id, req.query.date);
  sendSuccess(res, contract);
}

async function endContract(req, res) {
  const contract = await contractService.endContract(req.params.id, req.body.end_date);
  await req.audit({
    entityType: 'CONTRACT', entityId: req.params.id,
    action: 'ENDED', oldState: 'ACTIVE', newState: 'EXPIRED',
  });
  sendSuccess(res, contract, 'Contract ended');
}

async function getExpiringSoon(req, res) {
  const contracts = await contractService.getExpiringSoon(req.query.days || 30);
  sendSuccess(res, contracts);
}

async function listContracts(req, res) {
  const contracts = await contractService.listContracts(req.query);
  sendSuccess(res, contracts);
}

module.exports = { createContract, updateContract, getEmployeeContracts, getActiveContract, endContract, getExpiringSoon, listContracts };
