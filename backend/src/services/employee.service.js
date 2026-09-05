const employeeRepo = require('../repositories/employee.repository');
const { AppError } = require('../middleware/error.middleware');
const { buildPagination } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Service — CRUD + search + department grouping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new employee
 */
async function createEmployee(data) {
  // Check email uniqueness
  const existing = await employeeRepo.findByEmail(data.email);
  if (existing) {
    throw AppError.conflict(`Employee with email ${data.email} already exists`);
  }

  // Check employee code uniqueness (if provided)
  if (data.employee_code) {
    const existingCode = await employeeRepo.findByCode(data.employee_code);
    if (existingCode) {
      throw AppError.conflict(`Employee code ${data.employee_code} already exists`);
    }
  }

  const employee = await employeeRepo.create({
    ...data,
    email: data.email.toLowerCase(),
  });

  return employee;
}

/**
 * Update an existing employee
 */
async function updateEmployee(id, data) {
  const existing = await employeeRepo.findById(id);
  if (!existing) {
    throw AppError.notFound('Employee');
  }

  // If email is changing, check uniqueness
  if (data.email && data.email.toLowerCase() !== existing.email) {
    const emailExists = await employeeRepo.findByEmail(data.email);
    if (emailExists) {
      throw AppError.conflict(`Email ${data.email} is already in use`);
    }
    data.email = data.email.toLowerCase();
  }

  const updated = await employeeRepo.update(id, data);
  return updated;
}

/**
 * Get employee by ID with active contract
 */
async function getEmployee(id) {
  const employee = await employeeRepo.getWithActiveContract(id);
  if (!employee) {
    throw AppError.notFound('Employee');
  }
  return employee;
}

/**
 * List employees with filters and pagination
 */
async function listEmployees(queryParams) {
  const { page, limit, search, department, status, sort_by, sort_order } = queryParams;

  // If search is provided, use the search method
  if (search) {
    const rows = await employeeRepo.search(search, limit);
    return {
      employees: rows,
      pagination: buildPagination(1, limit, rows.length),
    };
  }

  const where = {};
  if (department) where.department = department;
  if (status) where.status = status;

  const { rows, total } = await employeeRepo.findAll({
    where,
    page,
    limit,
    sortBy: sort_by,
    sortOrder: sort_order,
  });

  return {
    employees: rows,
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Get employees grouped by department
 */
async function getEmployeesByDepartment() {
  const departments = await employeeRepo.getDepartments();
  const result = {};

  for (const dept of departments) {
    result[dept] = await employeeRepo.getByDepartment(dept);
  }

  return result;
}

/**
 * Archive (soft delete) an employee
 */
async function archiveEmployee(id) {
  const employee = await employeeRepo.findById(id);
  if (!employee) {
    throw AppError.notFound('Employee');
  }

  await employeeRepo.update(id, { status: 'TERMINATED' });
  await employeeRepo.delete(id);

  return { message: 'Employee archived successfully' };
}

/**
 * Get employee count by status
 */
async function getEmployeeStats() {
  return employeeRepo.countByStatus();
}

module.exports = {
  createEmployee,
  updateEmployee,
  getEmployee,
  listEmployees,
  getEmployeesByDepartment,
  archiveEmployee,
  getEmployeeStats,
};
