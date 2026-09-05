const payrunRepo = require('../repositories/payrun.repository');
const payslipRepo = require('../repositories/payslip.repository');
const employeeRepo = require('../repositories/employee.repository');
const contractRepo = require('../repositories/contract.repository');
const attendanceRepo = require('../repositories/attendance.repository');
const timeoffRepo = require('../repositories/timeoff.repository');
const { salaryRuleRepo } = require('../repositories/salary.repository');
const { computePayslip } = require('./computation.service');
const { logAudit } = require('../middleware/audit.middleware');
const { AppError } = require('../middleware/error.middleware');
const { VALID_TRANSITIONS } = require('../models/payrun.model');
const { loadEnv } = require('../config/env');
const { withTransaction } = require('../config/database');
const { invalidateCache } = require('../config/redis');
const boss = require('../jobs/queue');

// ─────────────────────────────────────────────────────────────────────────────
// ⭐ Payrun Service — State Machine (DRAFT → COMPUTED → VALIDATED → PAID)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new payrun in DRAFT state
 */
async function createPayrun(data, userId) {
  // Check for duplicate payrun
  const hasDup = await payrunRepo.hasDuplicate(data.period_start, data.period_end, data.department);
  if (hasDup) {
    throw AppError.conflict('A payrun already exists for this period and department');
  }

  const payrun = await payrunRepo.create({
    ...data,
    state: 'DRAFT',
  });

  await logAudit({
    entityType: 'PAYRUN',
    entityId: payrun.id,
    action: 'CREATED',
    performedBy: userId,
    newState: 'DRAFT',
    metadata: { name: payrun.name, period: `${data.period_start} - ${data.period_end}` },
  });

  return payrun;
}

/**
 * Validate state transition
 */
function validateTransition(currentState, targetState) {
  const allowed = VALID_TRANSITIONS[currentState];
  if (!allowed || !allowed.includes(targetState)) {
    throw AppError.invalidStateTransition(currentState, targetState, 'Payrun');
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPUTE PAYRUN — DRAFT → COMPUTED
 * The heart of the payroll system. Computes payslips for all employees.
 * ═══════════════════════════════════════════════════════════════════════════
 */
async function computePayrun(payrunId, userId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  validateTransition(payrun.state, 'COMPUTED');

  // Get salary rules for the structure
  const rules = await salaryRuleRepo.getByStructure(payrun.structure_id);
  if (rules.length === 0) {
    throw AppError.badRequest('Salary structure has no active rules');
  }

  // Get employees (filter by department if specified)
  const employees = await employeeRepo.getActiveEmployees(payrun.department);
  if (employees.length === 0) {
    throw AppError.badRequest('No active employees found for this payrun');
  }

  return withTransaction(async (client) => {
    // Delete existing payslips if recomputing
    if (payrun.state === 'COMPUTED' || payrun.state === 'VALIDATED') {
      await payslipRepo.deleteByPayrun(payrunId, client);
    }

    const results = { success: [], errors: [], warnings: [] };

    // Process each employee
    for (const employee of employees) {
      try {
        // Get active contract
        const contract = await contractRepo.getActiveForPeriod(
          employee.id, payrun.period_start, payrun.period_end
        );

        if (!contract) {
          results.warnings.push({
            employee_id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            issue: 'No active contract for period — skipped',
          });
          continue;
        }

        // Check for duplicate payslip
        const hasDup = await payslipRepo.hasDuplicate(
          employee.id, payrun.period_start, payrun.period_end
        );
        if (hasDup) {
          results.warnings.push({
            employee_id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            issue: 'Duplicate payslip exists — skipped',
          });
          continue;
        }

        // Get attendance summary
        const attendance = await attendanceRepo.getSummary(
          employee.id, payrun.period_start, payrun.period_end
        );

        // Get approved time off
        const timeoffDays = await timeoffRepo.getApprovedDays(
          employee.id, payrun.period_start, payrun.period_end
        );

        // ⭐ COMPUTE PAYSLIP using the engine
        const computed = computePayslip({
          employee,
          contract,
          attendance,
          timeoffDays,
          rules,
          periodStart: payrun.period_start,
          periodEnd: payrun.period_end,
        });

        // Create payslip record
        const payslip = await payslipRepo.create({
          employee_id: employee.id,
          payrun_id: payrunId,
          contract_id: contract.id,
          period_start: payrun.period_start,
          period_end: payrun.period_end,
          worked_days: computed.worked_days,
          total_days: computed.total_days,
          lines: JSON.stringify(computed.lines),
          gross: computed.gross,
          total_deductions: computed.total_deductions,
          net: computed.net,
          status: 'COMPUTED',
        }, client);

        results.success.push({
          employee_id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          payslip_id: payslip.id,
          net: computed.net,
        });

        // Generate warnings
        if (!employee.bank_account_number) {
          results.warnings.push({
            employee_id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            issue: 'Missing bank details',
          });
        }

        if (attendance.worked_days === 0) {
          results.warnings.push({
            employee_id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            issue: 'Zero attendance days recorded',
          });
        }
      } catch (error) {
        results.errors.push({
          employee_id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          error: error.message,
        });
      }
    }

    // Update payrun state only if at least one payslip was computed
    if (results.success.length > 0) {
      await payrunRepo.updateState(payrunId, 'COMPUTED', client);

      await logAudit({
        entityType: 'PAYRUN',
        entityId: payrunId,
        action: 'COMPUTED',
        performedBy: userId,
        oldState: payrun.state,
        newState: 'COMPUTED',
        metadata: {
          employee_count: results.success.length,
          total_net: results.success.reduce((sum, s) => sum + s.net, 0),
          errors: results.errors.length,
          warnings: results.warnings.length,
        },
      });
    } else if (results.errors.length > 0) {
      throw AppError.badRequest('No payslips could be computed. Check errors.', results.errors);
    }

    // Invalidate dashboard cache
    await invalidateCache('dashboard:*');

    return results;
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDATE PAYRUN — COMPUTED → VALIDATED
 * ═══════════════════════════════════════════════════════════════════════════
 */
async function validatePayrun(payrunId, userId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  validateTransition(payrun.state, 'VALIDATED');

  const payslips = await payslipRepo.getByPayrun(payrunId);
  if (payslips.length === 0) {
    throw AppError.badRequest('No payslips to validate');
  }

  const env = loadEnv();
  const errors = [];
  const warnings = [];

  for (const ps of payslips) {
    // Validation: All payslips must be COMPUTED
    if (ps.status !== 'COMPUTED') {
      errors.push(`Payslip for ${ps.first_name} ${ps.last_name} has status "${ps.status}" (expected COMPUTED)`);
    }

    // Validation: Net salary must be positive
    if (parseFloat(ps.net) < 0) {
      errors.push(`Payslip for ${ps.first_name} ${ps.last_name} has negative net salary: ${ps.net}`);
    }

    // Validation: Minimum wage check
    if (parseFloat(ps.net) < env.MIN_WAGE && parseFloat(ps.net) > 0) {
      warnings.push(`${ps.first_name} ${ps.last_name}: Net salary (${ps.net}) is below minimum wage (${env.MIN_WAGE})`);
    }

    // Warning: Missing bank details
    if (!ps.bank_account_number) {
      warnings.push(`${ps.first_name} ${ps.last_name}: Missing bank account details`);
    }
  }

  // Check for duplicate payslips within the payrun
  const employeeIds = payslips.map((p) => p.employee_id);
  const duplicates = employeeIds.filter((id, i) => employeeIds.indexOf(id) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate payslips found for employees: ${duplicates.join(', ')}`);
  }

  // If blocking errors exist, don't validate
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Update all payslip statuses
  await payslipRepo.updateStatusByPayrun(payrunId, 'VALIDATED');
  await payrunRepo.updateState(payrunId, 'VALIDATED');

  await logAudit({
    entityType: 'PAYRUN',
    entityId: payrunId,
    action: 'VALIDATED',
    performedBy: userId,
    oldState: payrun.state,
    newState: 'VALIDATED',
    metadata: {
      payslip_count: payslips.length,
      warnings: warnings.length,
    },
  });

  await invalidateCache('dashboard:*');

  return { valid: true, errors: [], warnings, payslip_count: payslips.length };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARK PAID — VALIDATED → PAID
 * ═══════════════════════════════════════════════════════════════════════════
 */
async function markPaid(payrunId, userId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  validateTransition(payrun.state, 'PAID');

  const payslips = await payslipRepo.getByPayrun(payrunId);

  // Verify all payslips are VALIDATED
  const nonValidated = payslips.filter((ps) => ps.status !== 'VALIDATED');
  if (nonValidated.length > 0) {
    throw AppError.badRequest(
      `${nonValidated.length} payslips are not in VALIDATED state. Validate the payrun first.`
    );
  }

  // Update all payslips to PAID
  await payslipRepo.updateStatusByPayrun(payrunId, 'PAID');
  await payrunRepo.updateState(payrunId, 'PAID');

  const totalNet = payslips.reduce((sum, ps) => sum + parseFloat(ps.net || 0), 0);

  await logAudit({
    entityType: 'PAYRUN',
    entityId: payrunId,
    action: 'PAID',
    performedBy: userId,
    oldState: payrun.state,
    newState: 'PAID',
    metadata: {
      payslip_count: payslips.length,
      total_net: totalNet,
    },
  });

  await invalidateCache('dashboard:*');

  return {
    message: 'Payrun marked as paid',
    payslip_count: payslips.length,
    total_net: totalNet,
  };
}

/**
 * Archive a payrun
 */
async function archivePayrun(payrunId, userId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  validateTransition(payrun.state, 'ARCHIVED');

  await payrunRepo.updateState(payrunId, 'ARCHIVED');

  await logAudit({
    entityType: 'PAYRUN',
    entityId: payrunId,
    action: 'ARCHIVED',
    performedBy: userId,
    oldState: payrun.state,
    newState: 'ARCHIVED',
  });

  return { message: 'Payrun archived' };
}

/**
 * Get payrun with summary
 */
async function getPayrun(payrunId) {
  const payrun = await payrunRepo.getWithSummary(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');
  return payrun;
}

/**
 * List payruns with filters
 */
async function listPayruns(queryParams = {}) {
  const where = {};
  if (queryParams.state) where.state = queryParams.state;

  return payrunRepo.findAll({
    where,
    page: queryParams.page || 1,
    limit: queryParams.limit || 20,
    sortBy: queryParams.sort_by || 'created_at',
    sortOrder: queryParams.sort_order || 'desc',
  });
}

/**
 * Delete a payrun (only in DRAFT state)
 */
async function deletePayrun(payrunId, userId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  if (payrun.state !== 'DRAFT') {
    throw AppError.badRequest('Only DRAFT payruns can be deleted');
  }

  await payrunRepo.delete(payrunId);

  await logAudit({
    entityType: 'PAYRUN',
    entityId: payrunId,
    action: 'DELETED',
    performedBy: userId,
    oldState: 'DRAFT',
  });

  return { message: 'Payrun deleted' };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * C.5 ENQUEUING JOBS (pg-boss PostgreSQL-backed)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Enqueue async payrun computation with singleton deduplication lock
 */
async function enqueueComputePayrun(payrunId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  const employees = await employeeRepo.getActiveEmployees(payrun.department);
  const employeeIds = employees.map((e) => e.id);

  // Enqueue computation job with singleton lock
  const jobId = await boss.send('payrun.compute', {
    payrunId,
    employeeIds,
  }, {
    // Singleton: prevent duplicate computation of same payrun
    singletonKey: `payrun-${payrunId}`,
    singletonMinutes: 30, // At most once per 30 min
    priority: 1, // High priority
  });

  return { jobId, status: 'queued', employeeCount: employeeIds.length };
}

/**
 * Send payslips asynchronously via batch email queue
 */
async function sendPayslips(payrunId) {
  const payslips = await payslipRepo.getByPayrun(payrunId);
  if (!payslips || payslips.length === 0) {
    throw AppError.badRequest('No payslips found for this payrun');
  }

  // Batch enqueue email jobs
  const jobs = payslips.map((p) => ({
    name: 'payslip.email',
    data: {
      payslipId: p.id,
      employeeEmail: p.email,
    },
    options: {
      retryLimit: 3,
      retryDelay: 60,
    },
  }));

  await boss.insert(jobs); // Batch insert for performance
  return { queued: jobs.length };
}

/**
 * Compute a single employee's payslip (called by pg-boss worker)
 */
async function computeSingleEmployeePayslip(payrunId, employeeId) {
  const payrun = await payrunRepo.findById(payrunId);
  if (!payrun) throw AppError.notFound('Payrun');

  const employee = await employeeRepo.findById(employeeId);
  if (!employee) throw AppError.notFound('Employee');

  const contract = await contractRepo.getActiveForPeriod(employeeId, payrun.period_start, payrun.period_end);
  if (!contract) return null;

  const rules = await salaryRuleRepo.getByStructure(payrun.structure_id);
  const attendance = await attendanceRepo.getSummary(employeeId, payrun.period_start, payrun.period_end);
  const timeoffDays = await timeoffRepo.getApprovedDays(employeeId, payrun.period_start, payrun.period_end);

  const computed = computePayslip({
    employee,
    contract,
    attendance,
    timeoffDays,
    rules,
    periodStart: payrun.period_start,
    periodEnd: payrun.period_end,
  });

  return payslipRepo.create({
    payrun_id: payrunId,
    employee_id: employeeId,
    contract_id: contract.id,
    period_start: payrun.period_start,
    period_end: payrun.period_end,
    worked_days: computed.worked_days,
    total_days: computed.total_days,
    gross: computed.gross,
    total_deductions: computed.total_deductions,
    net: computed.net,
    status: 'COMPUTED',
    lines: JSON.stringify(computed.lines),
    computation_log: JSON.stringify(computed.computation_log),
  });
}

module.exports = {
  createPayrun,
  computePayrun,
  enqueueComputePayrun,
  computeSingleEmployeePayslip,
  sendPayslips,
  validatePayrun,
  markPaid,
  archivePayrun,
  getPayrun,
  listPayruns,
  deletePayrun,
};
