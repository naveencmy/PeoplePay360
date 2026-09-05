const jwt = require('jsonwebtoken');
const { loadEnv } = require('./env');

// ─────────────────────────────────────────────────────────────────────────────
// JWT Configuration — Access & Refresh token generation/verification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate an access token
 * @param {Object} payload - Token payload { userId, email, role }
 * @returns {string} Signed JWT
 */
function generateAccessToken(payload) {
  const env = loadEnv();
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
    issuer: 'peoplepay360',
    audience: 'peoplepay360-api',
  });
}

/**
 * Generate a refresh token
 * @param {Object} payload - Token payload { userId }
 * @returns {string} Signed JWT
 */
function generateRefreshToken(payload) {
  const env = loadEnv();
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
    issuer: 'peoplepay360',
    audience: 'peoplepay360-api',
  });
}

/**
 * Verify an access token
 * @param {string} token - JWT string
 * @returns {Object} Decoded payload
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  const env = loadEnv();
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'peoplepay360',
    audience: 'peoplepay360-api',
  });
}

/**
 * Verify a refresh token
 * @param {string} token - JWT string
 * @returns {Object} Decoded payload
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
function verifyRefreshToken(token) {
  const env = loadEnv();
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'peoplepay360',
    audience: 'peoplepay360-api',
  });
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object { id, email, role }
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function generateTokenPair(user) {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
  });
  return { accessToken, refreshToken };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
