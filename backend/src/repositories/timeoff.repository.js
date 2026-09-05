const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Time Off Repository
// ─────────────────────────────────────────────────────────────────────────────

class TimeOffRepository extends BaseRepository {
  constructor() {
    super('timeoff_requests', [
      'employee_id', 'leave_type', 'date_from', 'date_to', 'duration',
      'reason', 'status', 'half_day', 'approved_by', 'rejection_reason',
    ]);
  }

  /**
   * Get approved days for an employee within a period (for payslip computation)
   */
  async getApprovedDays(employeeId, periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT COALESCE(SUM(duration), 0) AS approved_days
       FROM timeoff_requests
       WHERE employee_id = $1
         AND status = 'APPROVED'
         AND date_from <= $3 AND date_to >= $2
         AND deleted_at IS NULL`,
      [employeeId, periodStart, periodEnd]
    );
    return parseFloat(result.rows[0].approved_days) || 0;
  }

  /**
   * Get approved time off records for period (with leave type)
   */
  async getApprovedForPeriod(employeeId, periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT * FROM timeoff_requests
       WHERE employee_id = $1
         AND status = 'APPROVED'
         AND date_from <= $3 AND date_to >= $2
         AND deleted_at IS NULL
       ORDER BY date_from`,
      [employeeId, periodStart, periodEnd]
    );
    return result.rows;
  }

  /**
   * Get leave balance by type for an employee (within a year)
   */
  async getUsedLeaveByType(employeeId, year) {
    const result = await this.raw(
      `SELECT leave_type, COALESCE(SUM(duration), 0) AS used_days
       FROM timeoff_requests
       WHERE employee_id = $1
         AND status = 'APPROVED'
         AND EXTRACT(YEAR FROM date_from) = $2
         AND deleted_at IS NULL
       GROUP BY leave_type`,
      [employeeId, year]
    );
    return result.rows;
  }

  /**
   * Get pending requests for a manager (by their employees)
   */
  async getPendingForManager(managerId) {
    const result = await this.raw(
      `SELECT t.*, e.first_name, e.last_name, e.department
       FROM timeoff_requests t
       JOIN employees e ON e.id = t.employee_id
       WHERE e.manager_id = $1
         AND t.status = 'PENDING'
         AND t.deleted_at IS NULL
       ORDER BY t.created_at DESC`,
      [managerId]
    );
    return result.rows;
  }

  /**
   * Check for overlapping leave requests
   */
  async hasOverlap(employeeId, dateFrom, dateTo, excludeId = null) {
    let sql = `SELECT COUNT(*) AS count FROM timeoff_requests
               WHERE employee_id = $1
                 AND status IN ('PENDING', 'APPROVED')
                 AND date_from <= $3 AND date_to >= $2
                 AND deleted_at IS NULL`;
    const params = [employeeId, dateFrom, dateTo];

    if (excludeId) {
      sql += ' AND id != $4';
      params.push(excludeId);
    }

    const result = await this.raw(sql, params);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Get total approved days for a period across all employees
   */
  async getTotalApprovedForPeriod(periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT COALESCE(SUM(duration), 0) AS total_days, COUNT(*) AS request_count
       FROM timeoff_requests
       WHERE status = 'APPROVED'
         AND date_from <= $2 AND date_to >= $1
         AND deleted_at IS NULL`,
      [periodStart, periodEnd]
    );
    return result.rows[0];
  }

  async listAll(employeeId = null, status = null) {
    let sql = `SELECT t.*, e.first_name, e.last_name, e.employee_code, e.department
               FROM timeoff_requests t
               JOIN employees e ON e.id = t.employee_id
               WHERE t.deleted_at IS NULL`;
    const params = [];
    if (employeeId) {
      params.push(employeeId);
      sql += ` AND t.employee_id = $${params.length}`;
    }
    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND t.status = $${params.length}`;
    }
    sql += ` ORDER BY t.created_at DESC LIMIT 100`;
    const result = await this.raw(sql, params);
    return result.rows;
  }
}

module.exports = new TimeOffRepository();
