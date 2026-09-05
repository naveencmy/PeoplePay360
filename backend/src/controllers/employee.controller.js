const employeeService = require('../services/employee.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Controller
// ─────────────────────────────────────────────────────────────────────────────

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
  sendSuccess(res, employee);
}

async function listEmployees(req, res) {
  const result = await employeeService.listEmployees(req.query);
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
