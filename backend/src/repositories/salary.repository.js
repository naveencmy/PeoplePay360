const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// Salary Repository — Structures and Rules
// ─────────────────────────────────────────────────────────────────────────────

class SalaryStructureRepository extends BaseRepository {
  constructor() {
    super('salary_structures', ['name', 'description', 'active']);
  }

  /**
   * Get structure with its rules
   */
  async getWithRules(structureId) {
    const [structure, rulesResult] = await Promise.all([
      this.findById(structureId),
      this.raw(
        'SELECT * FROM salary_rules WHERE structure_id = $1 AND active = true AND deleted_at IS NULL ORDER BY sequence',
        [structureId]
      ),
    ]);

    if (!structure) return null;
    return { ...structure, rules: rulesResult.rows };
  }

  /**
   * Get active structures
   */
  async getActiveStructures() {
    const result = await this.raw(
      "SELECT * FROM salary_structures WHERE active = true AND deleted_at IS NULL ORDER BY name"
    );
    return result.rows;
  }
}

class SalaryRuleRepository extends BaseRepository {
  constructor() {
    super('salary_rules', [
      'structure_id', 'name', 'code', 'category', 'sequence',
      'computation_type', 'computation_basis', 'amount', 'formula',
      'condition', 'active', 'appears_on_payslip', 'note',
    ]);
  }

  /**
   * Get rules for a structure, ordered by sequence
   */
  async getByStructure(structureId) {
    const result = await this.raw(
      'SELECT * FROM salary_rules WHERE structure_id = $1 AND active = true AND deleted_at IS NULL ORDER BY sequence',
      [structureId]
    );
    return result.rows;
  }

  /**
   * Get a rule by its code within a structure
   */
  async getByCode(structureId, code) {
    const result = await this.raw(
      'SELECT * FROM salary_rules WHERE structure_id = $1 AND code = $2 AND deleted_at IS NULL',
      [structureId, code]
    );
    return result.rows[0] || null;
  }

  /**
   * Check if a rule code is unique within a structure
   */
  async isCodeUnique(structureId, code, excludeId = null) {
    let sql = 'SELECT COUNT(*) AS count FROM salary_rules WHERE structure_id = $1 AND code = $2 AND deleted_at IS NULL';
    const params = [structureId, code];

    if (excludeId) {
      sql += ' AND id != $3';
      params.push(excludeId);
    }

    const result = await this.raw(sql, params);
    return parseInt(result.rows[0].count, 10) === 0;
  }

  /**
   * Get rules that depend on a specific rule code
   */
  async getDependents(structureId, ruleCode) {
    const result = await this.raw(
      `SELECT * FROM salary_rules 
       WHERE structure_id = $1 
         AND (computation_basis = $2 OR formula LIKE $3)
         AND deleted_at IS NULL`,
      [structureId, ruleCode, `%${ruleCode}%`]
    );
    return result.rows;
  }

  /**
   * Bulk create rules for a structure (used in cloning)
   */
  async bulkCreate(rules, client = null) {
    const results = [];
    for (const rule of rules) {
      const created = await this.create(rule, client);
      results.push(created);
    }
    return results;
  }
}

const salaryStructureRepo = new SalaryStructureRepository();
const salaryRuleRepo = new SalaryRuleRepository();

module.exports = { salaryStructureRepo, salaryRuleRepo };
