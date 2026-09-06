const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Time Off / Leave Schemas
// ─────────────────────────────────────────────────────────────────────────────

const LEAVE_TYPES = [
  'CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID', 'COMP_OFF', 'PAID_LEAVE', 'PAID',
  'CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'UNPAID_LEAVE'
];

const createTimeOffSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  leave_type: z.enum(LEAVE_TYPES),
  date_from: z.string().min(1, 'Start date is required'),
  date_to: z.string().min(1, 'End date is required'),
  duration: z.number().positive('Duration must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500),
  half_day: z.boolean().default(false),
});

const approveRejectSchema = z.object({
  reason: z.string().max(500).optional(),
});

const timeOffQuerySchema = z.object({
  employee_id: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  leave_type: z.enum(LEAVE_TYPES).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const timeOffIdParamSchema = z.object({
  id: z.string().uuid('Invalid time off request ID'),
});

module.exports = {
  createTimeOffSchema,
  approveRejectSchema,
  timeOffQuerySchema,
  timeOffIdParamSchema,
};
