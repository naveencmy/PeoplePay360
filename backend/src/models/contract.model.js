const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Contract Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createContractSchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  name: z.string().min(1, 'Contract name is required').max(200),
  wage: z.number().positive('Wage must be positive'),
  wage_type: z.enum(['MONTHLY', 'HOURLY', 'ANNUAL']).default('MONTHLY'),
  structure_id: z.string().uuid('Invalid salary structure ID'),
  date_start: z.string().min(1, 'Start date is required'),
  date_end: z.string().optional().nullable(),
  state: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).default('DRAFT'),
  department: z.string().max(100).optional(),
  job_title: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

const updateContractSchema = createContractSchema.partial().omit({ employee_id: true });

const contractIdParamSchema = z.object({
  id: z.string().uuid('Invalid contract ID'),
});

module.exports = {
  createContractSchema,
  updateContractSchema,
  contractIdParamSchema,
};
