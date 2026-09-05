const contractRepo = require('../repositories/contract.repository');
const employeeRepo = require('../repositories/employee.repository');
const { AppError } = require('../middleware/error.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Contract Service — CRUD + overlap detection + period lookup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new contract
 */
async function createContract(data) {
  // Verify employee exists
  const employee = await employeeRepo.findById(data.employee_id);
  if (!employee) {
    throw AppError.notFound('Employee');
  }

  // Check for overlapping active contracts
  const hasOverlap = await contractRepo.hasOverlap(
    data.employee_id,
    data.date_start,
    data.date_end || '9999-12-31'
  );

  if (hasOverlap && data.state === 'ACTIVE') {
    throw AppError.conflict('Employee already has an active contract for this period');
  }

  const contract = await contractRepo.create(data);
  return contract;
}

/**
 * Update a contract
 */
async function updateContract(id, data) {
  const contract = await contractRepo.findById(id);
  if (!contract) {
    throw AppError.notFound('Contract');
  }

  // If changing dates or activating, check for overlaps
  if (data.date_start || data.date_end || data.state === 'ACTIVE') {
    const dateStart = data.date_start || contract.date_start;
    const dateEnd = data.date_end !== undefined ? data.date_end : contract.date_end;
    const newState = data.state || contract.state;

    if (newState === 'ACTIVE') {
      const hasOverlap = await contractRepo.hasOverlap(
        contract.employee_id,
        dateStart,
        dateEnd || '9999-12-31',
        id
      );

      if (hasOverlap) {
        throw AppError.conflict('Employee already has an active contract for this period');
      }
    }
  }

  return contractRepo.update(id, data);
}

/**
 * Get active contract for an employee
 */
async function getActiveContract(employeeId, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const contract = await contractRepo.getActiveForDate(employeeId, targetDate);
  return contract;
}

/**
 * Get all contracts for an employee
 */
async function getEmployeeContracts(employeeId) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    throw AppError.notFound('Employee');
  }
  return contractRepo.getByEmployee(employeeId);
}

/**
 * End a contract (set end date and change state)
 */
async function endContract(id, endDate) {
  const contract = await contractRepo.findById(id);
  if (!contract) {
    throw AppError.notFound('Contract');
  }

  if (contract.state !== 'ACTIVE') {
    throw AppError.badRequest('Only active contracts can be ended');
  }

  return contractRepo.update(id, {
    date_end: endDate,
    state: 'EXPIRED',
  });
}

/**
 * Get contracts expiring soon
 */
async function getExpiringSoon(days = 30) {
  return contractRepo.getExpiringSoon(days);
}

/**
 * Get contracts for multiple employees within a period (for payrun)
 */
async function getContractsForPeriod(employeeIds, periodStart, periodEnd) {
  return contractRepo.getActiveForEmployees(employeeIds, periodStart, periodEnd);
}

module.exports = {
  createContract,
  updateContract,
  getActiveContract,
  getEmployeeContracts,
  endContract,
  getExpiringSoon,
  getContractsForPeriod,
};
