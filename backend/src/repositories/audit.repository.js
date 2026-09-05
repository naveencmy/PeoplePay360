const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Audit Repository
// ─────────────────────────────────────────────────────────────────────────────

class AuditRepository extends BaseRepository {
  constructor() {
    super('audit_logs', [
      'entity_type', 'entity_id', 'action', 'performed_by',
      'performed_at', 'old_state', 'new_state', 'metadata',
    ]);
  }

  /**
   * Get audit trail for a specific entity
   */
  async getByEntity(entityType, entityId) {
    const result = await this.raw(
      `SELECT * FROM audit_logs 
       WHERE entity_type = $1 AND entity_id = $2 
       ORDER BY performed_at DESC`,
      [entityType, entityId]
    );
    return result.rows;
  }

  /**
   * Get recent audit logs
   */
  async getRecent(limit = 50) {
    const result = await this.raw(
      `SELECT a.*, u.first_name, u.last_name 
       FROM audit_logs a
       LEFT JOIN users u ON u.id::text = a.performed_by
       ORDER BY a.performed_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = new AuditRepository();
