const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Payslip Schemas
// ─────────────────────────────────────────────────────────────────────────────

const PAYSLIP_STATUSES = ['COMPUTED', 'VALIDATED', 'PAID', 'CANCELLED'];

const payslipLineSchema = z.object({
  rule_id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  category: z.enum(['BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'NET']),
  sequence: z.number().int(),
  amount: z.number(),
});

const createPayslipSchema = z.object({
  employee_id: z.string().uuid(),
  payrun_id: z.string().uuid(),
  contract_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  worked_days: z.number().min(0),
  total_days: z.number().min(0),
  lines: z.array(payslipLineSchema),
  gross: z.number(),
  total_deductions: z.number(),
  net: z.number(),
  status: z.enum(PAYSLIP_STATUSES).default('COMPUTED'),
});

const payslipIdParamSchema = z.object({
  id: z.string().uuid('Invalid payslip ID'),
});

const payslipQuerySchema = z.object({
  employee_id: z.string().uuid().optional(),
  payrun_id: z.string().uuid().optional(),
  status: z.enum(PAYSLIP_STATUSES).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

module.exports = {
  PAYSLIP_STATUSES,
  payslipLineSchema,
  createPayslipSchema,
  payslipIdParamSchema,
  payslipQuerySchema,
};
