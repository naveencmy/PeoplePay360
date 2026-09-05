const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Payslip Repository
// ─────────────────────────────────────────────────────────────────────────────

class PayslipRepository extends BaseRepository {
  constructor() {
    super('payslips', [
      'employee_id', 'payrun_id', 'contract_id', 'period_start', 'period_end',
      'worked_days', 'total_days', 'lines', 'gross', 'total_deductions', 'net',
      'status',
    ]);
  }

  /**
   * Get payslips for a payrun
   */
  async getByPayrun(payrunId) {
    const result = await this.raw(
      `SELECT ps.*, e.first_name, e.last_name, e.employee_code, e.department, e.email
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       WHERE ps.payrun_id = $1 AND ps.deleted_at IS NULL
       ORDER BY e.first_name, e.last_name`,
      [payrunId]
    );
    return result.rows;
  }

  /**
   * Get payslip with full employee details
   */
  async getWithEmployee(payslipId) {
    const result = await this.raw(
      `SELECT ps.*, 
              e.first_name, e.last_name, e.employee_code, e.email, 
              e.department, e.designation, e.bank_name, e.bank_account_number, e.bank_ifsc,
              p.name AS payrun_name, p.period_start AS payrun_period_start, p.period_end AS payrun_period_end
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       JOIN payruns p ON p.id = ps.payrun_id
       WHERE ps.id = $1 AND ps.deleted_at IS NULL`,
      [payslipId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get payslips for an employee (history)
   */
  async getByEmployee(employeeId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      this.raw(
        `SELECT ps.*, p.name AS payrun_name
         FROM payslips ps
         JOIN payruns p ON p.id = ps.payrun_id
         WHERE ps.employee_id = $1 AND ps.deleted_at IS NULL
         ORDER BY ps.period_start DESC
         LIMIT $2 OFFSET $3`,
        [employeeId, limit, offset]
      ),
      this.raw(
        'SELECT COUNT(*) AS total FROM payslips WHERE employee_id = $1 AND deleted_at IS NULL',
        [employeeId]
      ),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Check for duplicate payslip (same employee + period)
   */
  async hasDuplicate(employeeId, periodStart, periodEnd, excludeId = null) {
    let sql = `SELECT COUNT(*) AS count FROM payslips 
               WHERE employee_id = $1 
                 AND period_start = $2 AND period_end = $3 
                 AND status != 'CANCELLED' 
                 AND deleted_at IS NULL`;
    const params = [employeeId, periodStart, periodEnd];

    if (excludeId) {
      sql += ' AND id != $4';
      params.push(excludeId);
    }

    const result = await this.raw(sql, params);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Update status for all payslips in a payrun
   */
  async updateStatusByPayrun(payrunId, newStatus, client = null) {
    const exec = client ? client.query.bind(client) : this.raw.bind(this);
    const result = await exec(
      `UPDATE payslips SET status = $1, updated_at = NOW() 
       WHERE payrun_id = $2 AND deleted_at IS NULL RETURNING *`,
      [newStatus, payrunId]
    );
    return result.rows;
  }

  /**
   * Delete all payslips for a payrun (for recomputation)
   */
  async deleteByPayrun(payrunId, client = null) {
    const exec = client ? client.query.bind(client) : this.raw.bind(this);
    const result = await exec(
      `UPDATE payslips SET deleted_at = NOW() WHERE payrun_id = $1 AND deleted_at IS NULL`,
      [payrunId]
    );
    return result.rowCount;
  }

  /**
   * Get payslip summary for dashboard
   */
  async getSummaryForPeriod(periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT 
         COUNT(*) AS total_payslips,
         COUNT(CASE WHEN status = 'PAID' THEN 1 END) AS paid_count,
         COALESCE(SUM(CASE WHEN status = 'PAID' THEN net ELSE 0 END), 0) AS total_net_paid,
         COALESCE(AVG(CASE WHEN status = 'PAID' THEN net END), 0) AS avg_salary
       FROM payslips
       WHERE period_start >= $1 AND period_end <= $2 AND deleted_at IS NULL`,
      [periodStart, periodEnd]
    );
    return result.rows[0];
  }

  /**
   * Get salary by department for a period
   */
  async getSalaryByDepartment(periodStart, periodEnd) {
    const result = await this.raw(
      `SELECT e.department, 
              COUNT(ps.id) AS employee_count,
              COALESCE(SUM(ps.net), 0) AS total_net,
              COALESCE(AVG(ps.net), 0) AS avg_net
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       WHERE ps.period_start >= $1 AND ps.period_end <= $2 
         AND ps.status = 'PAID' AND ps.deleted_at IS NULL
       GROUP BY e.department
       ORDER BY total_net DESC`,
      [periodStart, periodEnd]
    );
    return result.rows;
  }

  /**
   * Get monthly salary trend
   */
  async getMonthlyTrend(months = 12) {
    const result = await this.raw(
      `SELECT 
         TO_CHAR(period_start, 'YYYY-MM') AS month,
         COUNT(*) AS payslip_count,
         COALESCE(SUM(net), 0) AS total_net,
         COALESCE(AVG(net), 0) AS avg_net
       FROM payslips
       WHERE status = 'PAID' 
         AND period_start >= CURRENT_DATE - INTERVAL '${months} months'
         AND deleted_at IS NULL
       GROUP BY TO_CHAR(period_start, 'YYYY-MM')
       ORDER BY month`
    );
    return result.rows;
  }
}

module.exports = new PayslipRepository();
