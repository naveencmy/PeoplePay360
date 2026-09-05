const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Schema
// ─────────────────────────────────────────────────────────────────────────────

const auditLogSchema = z.object({
  entity_type: z.string().min(1),
  entity_id: z.string().uuid(),
  action: z.string().min(1),
  performed_by: z.string(),
  old_state: z.string().optional().nullable(),
  new_state: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

const auditQuerySchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  performed_by: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

module.exports = { auditLogSchema, auditQuerySchema };
