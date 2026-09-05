const payrunService = require('../services/payrun.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');
const { buildPagination } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Payrun Controller — State Machine transitions
// ─────────────────────────────────────────────────────────────────────────────

async function createPayrun(req, res) {
  const payrun = await payrunService.createPayrun(req.body, req.user.userId);
  sendCreated(res, payrun, 'Payrun created in DRAFT state');
}

async function getPayrun(req, res) {
  const payrun = await payrunService.getPayrun(req.params.id);
  sendSuccess(res, payrun);
}

async function listPayruns(req, res) {
  const { rows, total } = await payrunService.listPayruns(req.query);
  const pagination = buildPagination(req.query.page || 1, req.query.limit || 20, total);
  sendSuccess(res, rows, 'Payruns retrieved', 200, pagination);
}

async function deletePayrun(req, res) {
  const result = await payrunService.deletePayrun(req.params.id, req.user.userId);
  sendSuccess(res, result);
}

// ═══ STATE TRANSITIONS ═══

async function computePayrun(req, res) {
  const result = await payrunService.computePayrun(req.params.id, req.user.userId);
  sendSuccess(res, result, 'Payrun computed successfully');
}

async function validatePayrun(req, res) {
  const result = await payrunService.validatePayrun(req.params.id, req.user.userId);
  sendSuccess(res, result, result.valid ? 'Payrun validated' : 'Validation failed');
}

async function markPaid(req, res) {
  const result = await payrunService.markPaid(req.params.id, req.user.userId);
  sendSuccess(res, result, 'Payrun marked as paid');
}

async function archivePayrun(req, res) {
  const result = await payrunService.archivePayrun(req.params.id, req.user.userId);
  sendSuccess(res, result);
}

module.exports = { createPayrun, getPayrun, listPayruns, deletePayrun, computePayrun, validatePayrun, markPaid, archivePayrun };
