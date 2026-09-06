const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Employee Repository
// ─────────────────────────────────────────────────────────────────────────────

class EmployeeRepository extends BaseRepository {
  constructor() {
    super('employees', [
      'employee_code', 'first_name', 'last_name', 'email', 'phone',
      'date_of_birth', 'gender', 'department', 'designation', 'hire_date',
      'work_location', 'manager_id', 'bank_name', 'bank_account_number',
      'bank_ifsc', 'pan_number', 'uan_number', 'status',
    ]);
  }

  /**
   * Find employee by email
   */
  async findByEmail(email) {
    const result = await this.raw(
      'SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  /**
   * Find employee by employee code
   */
  async findByCode(code) {
    const result = await this.raw(
      'SELECT * FROM employees WHERE employee_code = $1 AND deleted_at IS NULL',
      [code]
    );
    return result.rows[0] || null;
  }

  /**
   * Get active employees (optionally by department)
   */
  async getActiveEmployees(department = null) {
    let sql = "SELECT * FROM employees WHERE status = 'ACTIVE' AND deleted_at IS NULL";
    const params = [];

    if (department && !department.toLowerCase().includes('all')) {
      sql += ' AND department = $1';
      params.push(department);
    }

    sql += ' ORDER BY first_name, last_name';
    const result = await this.raw(sql, params);
    return result.rows;
  }

  /**
   * Get employees by department
   */
  async getByDepartment(department) {
    const result = await this.raw(
      "SELECT * FROM employees WHERE department = $1 AND status = 'ACTIVE' AND deleted_at IS NULL ORDER BY first_name",
      [department]
    );
    return result.rows;
  }

  /**
   * Full-text search on employee fields
   */
  async search(searchTerm, limit = 20) {
    const result = await this.raw(
      `SELECT * FROM employees 
       WHERE deleted_at IS NULL 
         AND (
           first_name ILIKE $1 OR last_name ILIKE $1 
           OR email ILIKE $1 OR employee_code ILIKE $1
           OR department ILIKE $1 OR designation ILIKE $1
         )
       ORDER BY first_name 
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return result.rows;
  }

  /**
   * Get distinct departments
   */
  async getDepartments() {
    const result = await this.raw(
      "SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND deleted_at IS NULL ORDER BY department"
    );
    return result.rows.map((r) => r.department);
  }

  /**
   * Get employee with their active contract
   */
  async getWithActiveContract(employeeId) {
    const result = await this.raw(
      `SELECT e.*, 
              c.id as contract_id, c.name as contract_name, c.wage, c.wage_type, 
              c.structure_id, c.date_start as contract_start, c.date_end as contract_end,
              c.state as contract_state
       FROM employees e
       LEFT JOIN contracts c ON c.employee_id = e.id AND c.state = 'ACTIVE' AND c.deleted_at IS NULL
       WHERE e.id = $1 AND e.deleted_at IS NULL`,
      [employeeId]
    );
    return result.rows[0] || null;
  }

  /**
   * Count employees by status
   */
  async countByStatus() {
    const result = await this.raw(
      `SELECT status, COUNT(*) as count 
       FROM employees 
       WHERE deleted_at IS NULL 
       GROUP BY status`
    );
    return result.rows;
  }
}

module.exports = new EmployeeRepository();
