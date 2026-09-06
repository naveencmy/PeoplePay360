const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Payrun Schemas
// ─────────────────────────────────────────────────────────────────────────────

// Valid state transitions
const PAYRUN_STATES = ['DRAFT', 'COMPUTED', 'VALIDATED', 'PAID', 'ARCHIVED'];

const VALID_TRANSITIONS = {
  DRAFT: ['COMPUTED', 'ARCHIVED'],
  COMPUTED: ['VALIDATED', 'DRAFT', 'ARCHIVED', 'COMPUTED'],  // Allow re-computation
  VALIDATED: ['PAID', 'COMPUTED', 'ARCHIVED'],    // Allow COMPUTED for re-validation
  PAID: ['ARCHIVED'],
  ARCHIVED: [],
};

const createPayrunSchema = z.object({
  name: z.string().min(1, 'Payrun name is required').max(200),
  period_start: z.string().min(1, 'Period start date is required'),
  period_end: z.string().min(1, 'Period end date is required'),
  structure_id: z.string().uuid('Invalid salary structure ID'),
  department: z.string().max(100).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  employeeIds: z.array(z.string().uuid()).optional(),
  employee_ids: z.array(z.string().uuid()).optional(),
});

const updatePayrunSchema = createPayrunSchema.partial();

const payrunIdParamSchema = z.object({
  id: z.string().uuid('Invalid payrun ID'),
});

const payrunQuerySchema = z.object({
  state: z.enum(PAYRUN_STATES).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'period_start', 'state', 'name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = {
  PAYRUN_STATES,
  VALID_TRANSITIONS,
  createPayrunSchema,
  updatePayrunSchema,
  payrunIdParamSchema,
  payrunQuerySchema,
};
