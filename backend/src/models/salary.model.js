const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Salary Structure & Rule Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createStructureSchema = z.object({
  name: z.string().min(1, 'Structure name is required').max(200),
  description: z.string().max(500).optional(),
  active: z.boolean().default(true),
});

const updateStructureSchema = createStructureSchema.partial();

const createRuleSchema = z.object({
  structure_id: z.string().uuid('Invalid structure ID').optional(),
  name: z.string().min(1, 'Rule name is required').max(200),
  code: z.string().min(1, 'Rule code is required').max(50)
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Code must be uppercase alphanumeric with underscores, starting with a letter'),
  category: z.enum(['BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'NET']),
  sequence: z.number().int().min(0, 'Sequence must be non-negative'),
  computation_type: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA']),
  computation_basis: z.string().max(50).optional().nullable(),
  amount: z.number().default(0),
  formula: z.string().max(500).optional().nullable(),
  condition: z.string().max(500).optional().nullable(),
  active: z.boolean().default(true),
});

const updateRuleSchema = createRuleSchema.partial().omit({ structure_id: true });

const structureIdParamSchema = z.object({
  id: z.string().uuid('Invalid structure ID'),
});

const ruleIdParamSchema = z.object({
  ruleId: z.string().uuid('Invalid rule ID'),
});

module.exports = {
  createStructureSchema,
  updateStructureSchema,
  createRuleSchema,
  updateRuleSchema,
  structureIdParamSchema,
  ruleIdParamSchema,
};
