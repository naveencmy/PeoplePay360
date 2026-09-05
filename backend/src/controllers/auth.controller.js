const authService = require('../services/auth.service');
const { sendSuccess, sendCreated } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Auth Controller — HTTP handling only, delegates to auth.service
// ─────────────────────────────────────────────────────────────────────────────

async function register(req, res) {
  const result = await authService.register(req.body);
  sendCreated(res, result, 'Registration successful');
}

async function login(req, res) {
  const result = await authService.login(req.body);
  sendSuccess(res, result, 'Login successful');
}

async function refreshToken(req, res) {
  const result = await authService.refreshToken(req.body.refresh_token);
  sendSuccess(res, result, 'Token refreshed');
}

async function changePassword(req, res) {
  const result = await authService.changePassword(req.user.userId, req.body);
  sendSuccess(res, result);
}

async function getProfile(req, res) {
  const user = await authService.getProfile(req.user.userId);
  sendSuccess(res, user);
}

async function logout(req, res) {
  const result = await authService.logout(req.user.userId);
  sendSuccess(res, result);
}

async function listUsers(req, res) {
  const users = await authService.listUsers();
  sendSuccess(res, users);
}

module.exports = { register, login, refreshToken, changePassword, getProfile, logout, listUsers };
