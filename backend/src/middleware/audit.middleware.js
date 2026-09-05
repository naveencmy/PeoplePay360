const { query } = require('../config/database');
const { v7: uuidv7 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────────────
// Audit Trail Middleware — logs every significant action for compliance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log an audit entry to the database
 * @param {Object} params
 * @param {string} params.entityType - e.g., 'PAYRUN', 'EMPLOYEE', 'PAYSLIP'
 * @param {string} params.entityId - UUID of the affected entity
 * @param {string} params.action - e.g., 'CREATED', 'UPDATED', 'COMPUTED', 'VALIDATED'
 * @param {string} params.performedBy - UserId of the actor
 * @param {string} [params.oldState] - Previous state (for state machines)
 * @param {string} [params.newState] - New state
 * @param {Object} [params.metadata] - Additional context (JSON)
 */
async function logAudit({ entityType, entityId, action, performedBy, oldState = null, newState = null, metadata = null }) {
  try {
    await query(
      `INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, performed_at, old_state, new_state, metadata)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)`,
      [
        uuidv7(),
        entityType,
        entityId,
        action,
        performedBy,
        oldState,
        newState,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('⚠️ Audit log failed:', error.message);
  }
}

/**
 * Express middleware that provides req.audit() helper function
 * Attaches a convenience method to the request object
 */
function auditMiddleware(req, _res, next) {
  req.audit = (params) => {
    return logAudit({
      ...params,
      performedBy: req.user?.userId || 'SYSTEM',
    });
  };
  next();
}

module.exports = { logAudit, auditMiddleware };
