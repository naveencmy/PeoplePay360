const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Contract Repository
// ─────────────────────────────────────────────────────────────────────────────

class ContractRepository extends BaseRepository {
  constructor() {
    super('contracts', [
      'employee_id', 'name', 'wage', 'wage_type', 'structure_id',
      'date_start', 'date_end', 'state', 'department', 'job_title', 'notes',
    ]);
  }

  /**
   * Get active contract for an employee at a specific date
   */
  async getActiveForDate(employeeId, date) {
    const result = await this.raw(
      `SELECT * FROM contracts 
       WHERE employee_id = $1 
         AND state = 'ACTIVE' 
         AND date_start <= $2 
         AND (date_end IS NULL OR date_end >= $2)
         AND deleted_at IS NULL
       ORDER BY date_start DESC 
       LIMIT 1`,
      [employeeId, date]
    );
    return result.rows[0] || null;
  }

  /**
   * Get active contract for an employee within a period
   */
  async getActiveForPeriod(employeeId, periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT * FROM contracts 
       WHERE employee_id = $1 
         AND state = 'ACTIVE' 
         AND date_start <= $2 
         AND (date_end IS NULL OR date_end >= $3)
         AND deleted_at IS NULL
       ORDER BY date_start DESC 
       LIMIT 1`,
      [employeeId, periodEnd, periodStart]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all contracts for an employee
   */
  async getByEmployee(employeeId) {
    const result = await this.raw(
      'SELECT * FROM contracts WHERE employee_id = $1 AND deleted_at IS NULL ORDER BY date_start DESC',
      [employeeId]
    );
    return result.rows;
  }

  /**
   * Check for overlapping contracts
   */
  async hasOverlap(employeeId, dateStart, dateEnd, excludeId = null) {
    let sql = `SELECT COUNT(*) as count FROM contracts 
               WHERE employee_id = $1 
                 AND state = 'ACTIVE'
                 AND date_start <= $3 
                 AND (date_end IS NULL OR date_end >= $2)
                 AND deleted_at IS NULL`;
    const params = [employeeId, dateStart, dateEnd || '9999-12-31'];

    if (excludeId) {
      sql += ' AND id != $4';
      params.push(excludeId);
    }

    const result = await this.raw(sql, params);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Bulk fetch active contracts for multiple employees within a period
   */
  async getActiveForEmployees(employeeIds, periodStart, periodEnd) {
    if (employeeIds.length === 0) return [];

    const placeholders = employeeIds.map((_, i) => `$${i + 1}`).join(', ');
    const result = await this.raw(
      `SELECT * FROM contracts 
       WHERE employee_id IN (${placeholders}) 
         AND state = 'ACTIVE' 
         AND date_start <= $${employeeIds.length + 1}
         AND (date_end IS NULL OR date_end >= $${employeeIds.length + 2})
         AND deleted_at IS NULL`,
      [...employeeIds, periodEnd, periodStart]
    );
    return result.rows;
  }

  /**
   * Get contracts expiring within N days
   */
  async getExpiringSoon(days = 30) {
    const result = await this.raw(
      `SELECT c.*, e.first_name, e.last_name, e.email
       FROM contracts c
       JOIN employees e ON e.id = c.employee_id
       WHERE c.state = 'ACTIVE'
         AND c.date_end IS NOT NULL
         AND c.date_end <= CURRENT_DATE + INTERVAL '${days} days'
         AND c.date_end >= CURRENT_DATE
         AND c.deleted_at IS NULL
       ORDER BY c.date_end`
    );
    return result.rows;
  }
}

module.exports = new ContractRepository();
