const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createEmployeeSchema = z.object({
  employee_code: z.string().max(20).optional(),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  hire_date: z.string().min(1, 'Hire date is required'),
  work_location: z.string().max(200).optional(),
  manager_id: z.string().uuid().optional().nullable(),
  bank_name: z.string().max(100).optional(),
  bank_account_number: z.string().max(50).optional(),
  bank_ifsc: z.string().max(20).optional(),
  pan_number: z.string().max(20).optional(),
  uan_number: z.string().max(30).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']).default('ACTIVE'),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

const employeeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']).optional(),
  sort_by: z.enum(['first_name', 'last_name', 'hire_date', 'department', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

const employeeIdParamSchema = z.object({
  id: z.string().uuid('Invalid employee ID'),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  employeeIdParamSchema,
};
