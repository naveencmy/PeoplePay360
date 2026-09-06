const { salaryStructureRepo, salaryRuleRepo } = require('../repositories/salary.repository');
const { AppError } = require('../middleware/error.middleware');
const { validateFormula, extractVariables } = require('../utils/computation.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Salary Service — Structure and Rule management
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════ STRUCTURES ═══════════════

/**
 * Create a salary structure
 */
async function createStructure(data) {
  return salaryStructureRepo.create(data);
}

/**
 * Update a salary structure
 */
async function updateStructure(id, data) {
  const structure = await salaryStructureRepo.findById(id);
  if (!structure) throw AppError.notFound('Salary Structure');
  return salaryStructureRepo.update(id, data);
}

/**
 * Get a structure with its rules
 */
async function getStructure(id) {
  const structure = await salaryStructureRepo.getWithRules(id);
  if (!structure) throw AppError.notFound('Salary Structure');
  return structure;
}

/**
 * List all structures
 */
async function listStructures() {
  return salaryStructureRepo.getActiveStructures();
}

/**
 * Delete a structure (soft delete)
 */
async function deleteStructure(id) {
  const structure = await salaryStructureRepo.findById(id);
  if (!structure) throw AppError.notFound('Salary Structure');
  await salaryStructureRepo.delete(id);
  return { message: 'Structure deleted successfully' };
}

/**
 * Clone a salary structure (deep copy with rules)
 */
async function cloneStructure(id, newName) {
  const source = await salaryStructureRepo.getWithRules(id);
  if (!source) throw AppError.notFound('Salary Structure');

  return salaryStructureRepo.transaction(async (client) => {
    // Create new structure
    const newStructure = await salaryStructureRepo.create(
      { name: newName || `${source.name} (Copy)`, description: source.description, active: true },
      client
    );

    // Clone all rules
    const newRules = [];
    for (const rule of source.rules) {
      const { id: _oldId, structure_id: _oldStructId, created_at, updated_at, deleted_at, ...ruleData } = rule;
      const newRule = await salaryRuleRepo.create(
        { ...ruleData, structure_id: newStructure.id },
        client
      );
      newRules.push(newRule);
    }

    return { ...newStructure, rules: newRules };
  });
}

// ═══════════════ RULES ═══════════════

/**
 * Add a rule to a structure
 */
async function addRule(data) {
  // Verify structure exists
  const structure = await salaryStructureRepo.findById(data.structure_id);
  if (!structure) throw AppError.notFound('Salary Structure');

  // Check code uniqueness within structure
  const isUnique = await salaryRuleRepo.isCodeUnique(data.structure_id, data.code);
  if (!isUnique) {
    throw AppError.conflict(`Rule code "${data.code}" already exists in this structure`);
  }

  // Validate formula if type is FORMULA
  if (data.computation_type === 'FORMULA' && data.formula) {
    const existingRules = await salaryRuleRepo.getByStructure(data.structure_id);
    const availableVars = existingRules.map((r) => r.code);
    if (!availableVars.includes('WAGE')) availableVars.push('WAGE');
    const validation = validateFormula(data.formula, availableVars);
    if (!validation.valid) {
      throw AppError.badRequest(`Invalid formula: ${validation.error}`);
    }
  }

  // Validate computation_basis reference (WAGE is a built-in contract variable)
  if (data.computation_type === 'PERCENTAGE' && data.computation_basis) {
    if (data.computation_basis !== 'WAGE') {
      const basisRule = await salaryRuleRepo.getByCode(data.structure_id, data.computation_basis);
      if (!basisRule) {
        throw AppError.badRequest(`Computation basis "${data.computation_basis}" does not exist in this structure`);
      }
    }
  }

  return salaryRuleRepo.create(data);
}

/**
 * Update a rule
 */
async function updateRule(ruleId, data) {
  const rule = await salaryRuleRepo.findById(ruleId);
  if (!rule) throw AppError.notFound('Salary Rule');

  // Check code uniqueness if code is changing
  if (data.code && data.code !== rule.code) {
    const isUnique = await salaryRuleRepo.isCodeUnique(rule.structure_id, data.code, ruleId);
    if (!isUnique) {
      throw AppError.conflict(`Rule code "${data.code}" already exists in this structure`);
    }
  }

  // Validate formula if provided
  if (data.computation_type === 'FORMULA' && data.formula) {
    const existingRules = await salaryRuleRepo.getByStructure(rule.structure_id);
    const availableVars = existingRules.filter((r) => r.id !== ruleId).map((r) => r.code);
    if (!availableVars.includes('WAGE')) availableVars.push('WAGE');
    const validation = validateFormula(data.formula, availableVars);
    if (!validation.valid) {
      throw AppError.badRequest(`Invalid formula: ${validation.error}`);
    }
  }

  // Validate computation_basis reference (WAGE is a built-in contract variable)
  if (data.computation_type === 'PERCENTAGE' && data.computation_basis) {
    if (data.computation_basis !== 'WAGE') {
      const basisRule = await salaryRuleRepo.getByCode(rule.structure_id, data.computation_basis);
      if (!basisRule) {
        throw AppError.badRequest(`Computation basis "${data.computation_basis}" does not exist in this structure`);
      }
    }
  }

  return salaryRuleRepo.update(ruleId, data);
}

/**
 * Delete a rule (check for dependents first)
 */
async function deleteRule(ruleId) {
  const rule = await salaryRuleRepo.findById(ruleId);
  if (!rule) throw AppError.notFound('Salary Rule');

  // Check if other rules depend on this one
  const dependents = await salaryRuleRepo.getDependents(rule.structure_id, rule.code);
  const otherDependents = dependents.filter((d) => d.id !== ruleId);

  if (otherDependents.length > 0) {
    throw AppError.conflict(
      `Cannot delete rule "${rule.code}" because these rules depend on it: ${otherDependents.map((d) => d.code).join(', ')}`
    );
  }

  await salaryRuleRepo.delete(ruleId);
  return { message: 'Rule deleted successfully' };
}

/**
 * Get rules for a structure
 */
async function getRulesForStructure(structureId) {
  return salaryRuleRepo.getByStructure(structureId);
}

module.exports = {
  createStructure,
  updateStructure,
  getStructure,
  listStructures,
  deleteStructure,
  cloneStructure,
  addRule,
  updateRule,
  deleteRule,
  getRulesForStructure,
};
