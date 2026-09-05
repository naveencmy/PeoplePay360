const salaryService = require('../services/salary.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Salary Controller — Structures and Rules
// ─────────────────────────────────────────────────────────────────────────────

// ═══ STRUCTURES ═══

async function createStructure(req, res) {
  const structure = await salaryService.createStructure(req.body);
  sendCreated(res, structure, 'Salary structure created');
}

async function updateStructure(req, res) {
  const structure = await salaryService.updateStructure(req.params.id, req.body);
  sendSuccess(res, structure, 'Structure updated');
}

async function getStructure(req, res) {
  const structure = await salaryService.getStructure(req.params.id);
  sendSuccess(res, structure);
}

async function listStructures(req, res) {
  const structures = await salaryService.listStructures();
  sendSuccess(res, structures);
}

async function deleteStructure(req, res) {
  const result = await salaryService.deleteStructure(req.params.id);
  sendSuccess(res, result);
}

async function cloneStructure(req, res) {
  const structure = await salaryService.cloneStructure(req.params.id, req.body.name);
  sendCreated(res, structure, 'Structure cloned');
}

// ═══ RULES ═══

async function addRule(req, res) {
  const rule = await salaryService.addRule({ ...req.body, structure_id: req.params.id });
  sendCreated(res, rule, 'Rule added');
}

async function updateRule(req, res) {
  const rule = await salaryService.updateRule(req.params.ruleId, req.body);
  sendSuccess(res, rule, 'Rule updated');
}

async function deleteRule(req, res) {
  const result = await salaryService.deleteRule(req.params.ruleId);
  sendSuccess(res, result);
}

async function getRules(req, res) {
  const rules = await salaryService.getRulesForStructure(req.params.id);
  sendSuccess(res, rules);
}

module.exports = {
  createStructure, updateStructure, getStructure, listStructures, deleteStructure, cloneStructure,
  addRule, updateRule, deleteRule, getRules,
};
