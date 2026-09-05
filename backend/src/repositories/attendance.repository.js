const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Repository
// ─────────────────────────────────────────────────────────────────────────────

class AttendanceRepository extends BaseRepository {
  constructor() {
    super('attendance', [
      'employee_id', 'date', 'check_in', 'check_out', 'worked_hours', 'status', 'notes',
    ]);
  }

  /**
   * Get today's attendance record for an employee (open check-in)
   */
  async getTodayRecord(employeeId) {
    const result = await this.raw(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 AND date = CURRENT_DATE AND deleted_at IS NULL
       ORDER BY check_in DESC LIMIT 1`,
      [employeeId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get open check-in (no check-out yet)
   */
  async getOpenCheckIn(employeeId) {
    const result = await this.raw(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 AND check_out IS NULL AND deleted_at IS NULL
       ORDER BY check_in DESC LIMIT 1`,
      [employeeId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get attendance summary for period
   * @returns {{ worked_days, total_hours, absent_days, total_working_days }}
   */
  async getSummary(employeeId, periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT 
         COUNT(DISTINCT date) AS worked_days,
         COALESCE(SUM(worked_hours), 0) AS total_hours
       FROM attendance 
       WHERE employee_id = $1 
         AND date >= $2 AND date <= $3 
         AND deleted_at IS NULL`,
      [employeeId, periodStart, periodEnd]
    );

    const summary = result.rows[0];
    return {
      worked_days: parseInt(summary.worked_days, 10) || 0,
      total_hours: parseFloat(summary.total_hours) || 0,
    };
  }

  /**
   * Get daily attendance records for an employee within a period
   */
  async getByPeriod(employeeId, periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 AND date >= $2 AND date <= $3 AND deleted_at IS NULL
       ORDER BY date`,
      [employeeId, periodStart, periodEnd]
    );
    return result.rows;
  }

  /**
   * Detect attendance anomalies (employees with >50% absence)
   */
  async getAnomalies(periodStart, periodEnd, threshold = 50) {
    const result = await this.raw(
      `WITH working_days AS (
         SELECT $1::date + generate_series(0, $2::date - $1::date) AS d
       ),
       total_working AS (
         SELECT COUNT(*) AS total FROM working_days WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
       )
       SELECT e.id, e.first_name, e.last_name, e.department,
              COUNT(DISTINCT a.date) AS present_days,
              tw.total AS total_days,
              ROUND(COUNT(DISTINCT a.date)::numeric / GREATEST(tw.total, 1) * 100, 1) AS attendance_pct
       FROM employees e
       CROSS JOIN total_working tw
       LEFT JOIN attendance a ON a.employee_id = e.id 
         AND a.date >= $1 AND a.date <= $2 AND a.deleted_at IS NULL
       WHERE e.status = 'ACTIVE' AND e.deleted_at IS NULL
       GROUP BY e.id, e.first_name, e.last_name, e.department, tw.total
       HAVING ROUND(COUNT(DISTINCT a.date)::numeric / GREATEST(tw.total, 1) * 100, 1) < $3
       ORDER BY attendance_pct`,
      [periodStart, periodEnd, threshold]
    );
    return result.rows;
  }

  /**
   * Bulk insert attendance records
   */
  async bulkCreate(records) {
    const values = [];
    const placeholders = [];
    let paramIndex = 1;

    for (const record of records) {
      const id = this.generateId();
      placeholders.push(
        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
      );
      values.push(id, record.employee_id, record.date, record.check_in, record.check_out, record.worked_hours || 0, record.notes || null);
      paramIndex += 7;
    }

    const result = await this.raw(
      `INSERT INTO attendance (id, employee_id, date, check_in, check_out, worked_hours, notes) 
       VALUES ${placeholders.join(', ')} RETURNING *`,
      values
    );
    return result.rows;
  }
}

module.exports = new AttendanceRepository();
