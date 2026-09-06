const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Payrun Repository
// ─────────────────────────────────────────────────────────────────────────────

class PayrunRepository extends BaseRepository {
  constructor() {
    super('payruns', [
      'name', 'period_start', 'period_end', 'structure_id',
      'state', 'department', 'notes', 'computed_at', 'validated_at', 'paid_at',
    ]);
  }

  /**
   * Get payrun with summary statistics
   */
  async getWithSummary(payrunId) {
    const result = await this.raw(
      `SELECT p.*,
              COUNT(ps.id) AS payslip_count,
              COALESCE(SUM(ps.gross), 0) AS total_gross,
              COALESCE(SUM(ps.total_deductions), 0) AS total_deductions,
              COALESCE(SUM(ps.net), 0) AS total_net,
              COALESCE(AVG(ps.net), 0) AS avg_net,
              (
                SELECT COUNT(*) FROM employees e
                WHERE e.status = 'ACTIVE' AND e.deleted_at IS NULL
                AND (p.department IS NULL OR LOWER(p.department) LIKE '%all%' OR e.department = p.department)
              ) AS eligible_count
       FROM payruns p
       LEFT JOIN payslips ps ON ps.payrun_id = p.id AND ps.deleted_at IS NULL
       WHERE p.id = $1 AND p.deleted_at IS NULL
       GROUP BY p.id`,
      [payrunId]
    );
    return result.rows[0] || null;
  }

  /**
   * Check for duplicate payrun (same period + department)
   */
  async hasDuplicate(periodStart, periodEnd, department = null, excludeId = null) {
    let sql = `SELECT COUNT(*) AS count FROM payruns 
               WHERE period_start = $1 AND period_end = $2 
               AND state NOT IN ('ARCHIVED') AND deleted_at IS NULL`;
    const params = [periodStart, periodEnd];
    let paramIndex = 3;

    if (department) {
      sql += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (excludeId) {
      sql += ` AND id != $${paramIndex}`;
      params.push(excludeId);
    }

    const result = await this.raw(sql, params);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Update payrun state with timestamp
   */
  async updateState(payrunId, newState, client = null) {
    const timestampField = {
      COMPUTED: 'computed_at',
      VALIDATED: 'validated_at',
      PAID: 'paid_at',
    }[newState];

    let sql = `UPDATE payruns SET state = $1, updated_at = NOW()`;
    const params = [newState];

    if (timestampField) {
      sql += `, ${timestampField} = NOW()`;
    }

    sql += ` WHERE id = $2 RETURNING *`;
    params.push(payrunId);

    const exec = client ? client.query.bind(client) : this.raw.bind(this);
    const result = await exec(sql, params);
    return result.rows[0] || null;
  }
}

module.exports = new PayrunRepository();
