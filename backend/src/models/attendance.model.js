const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Schemas
// ─────────────────────────────────────────────────────────────────────────────

const checkInSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID').optional(),
  check_in: z.string().optional(),
  time: z.union([z.string(), z.date()]).optional(),
  timestamp: z.union([z.string(), z.date()]).optional(),
  notes: z.string().max(500).optional(),
});

const checkOutSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID').optional(),
  check_out: z.string().optional(),
  time: z.union([z.string(), z.date()]).optional(),
  timestamp: z.union([z.string(), z.date()]).optional(),
  notes: z.string().max(500).optional(),
});

const attendanceSummaryQuerySchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
});

const bulkAttendanceSchema = z.object({
  records: z.array(z.object({
    employee_id: z.string().uuid(),
    date: z.string(),
    check_in: z.string(),
    check_out: z.string(),
    notes: z.string().max(500).optional(),
  })).min(1, 'At least one record is required'),
});

module.exports = {
  checkInSchema,
  checkOutSchema,
  attendanceSummaryQuerySchema,
  bulkAttendanceSchema,
};
