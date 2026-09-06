const employeeService = require('../services/employee.service');
const userRepo = require('../repositories/user.repository');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Controller
// ─────────────────────────────────────────────────────────────────────────────

async function getAuthEmployeeId(req) {
  if (req.user?.employeeId) return req.user.employeeId;
  if (req.user?.userId) {
    const user = await userRepo.findById(req.user.userId);
    if (user?.employee_id) return user.employee_id;
  }
  return null;
}

function maskSensitiveFields(emp) {
  if (!emp) return emp;
  const safe = { ...emp };
  delete safe.pan_number;
  delete safe.bank_account_number;
  delete safe.bank_ifsc;
  delete safe.uan_number;
  delete safe.wage;
  return safe;
}

async function createEmployee(req, res) {
  const employee = await employeeService.createEmployee(req.body);
  await req.audit({ entityType: 'EMPLOYEE', entityId: employee.id, action: 'CREATED' });
  sendCreated(res, employee, 'Employee created successfully');
}

async function updateEmployee(req, res) {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  await req.audit({ entityType: 'EMPLOYEE', entityId: req.params.id, action: 'UPDATED' });
  sendSuccess(res, employee, 'Employee updated successfully');
}

async function getEmployee(req, res) {
  const employee = await employeeService.getEmployee(req.params.id);
  if (req.user?.role === 'EMPLOYEE') {
    const userEmpId = await getAuthEmployeeId(req);
    if (userEmpId !== req.params.id) {
      return sendSuccess(res, maskSensitiveFields(employee));
    }
  }
  sendSuccess(res, employee);
}

async function listEmployees(req, res) {
  const result = await employeeService.listEmployees(req.query);
  if (req.user?.role === 'EMPLOYEE') {
    const userEmpId = await getAuthEmployeeId(req);
    const sanitized = (result.employees || []).map(emp => 
      emp.id === userEmpId ? emp : maskSensitiveFields(emp)
    );
    return sendSuccess(res, sanitized, 'Employees retrieved', 200, result.pagination);
  }
  sendSuccess(res, result.employees, 'Employees retrieved', 200, result.pagination);
}

async function getByDepartment(req, res) {
  const result = await employeeService.getEmployeesByDepartment();
  sendSuccess(res, result);
}

async function archiveEmployee(req, res) {
  const result = await employeeService.archiveEmployee(req.params.id);
  await req.audit({ entityType: 'EMPLOYEE', entityId: req.params.id, action: 'ARCHIVED' });
  sendSuccess(res, result);
}

async function getStats(req, res) {
  const stats = await employeeService.getEmployeeStats();
  sendSuccess(res, stats);
}

module.exports = { createEmployee, updateEmployee, getEmployee, listEmployees, getByDepartment, archiveEmployee, getStats };
