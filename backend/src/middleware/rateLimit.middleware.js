const rateLimit = require('express-rate-limit');
const { loadEnv } = require('../config/env');

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting Middleware — general + auth-specific stricter limits
// ─────────────────────────────────────────────────────────────────────────────

/**
 * General API rate limiter
 */
function createGeneralLimiter() {
  const env = loadEnv();
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });
}

/**
 * Auth-specific stricter rate limiter (prevents brute force)
 * 10 attempts per 15 minutes for login/register
 */
function createAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  });
}

/**
 * Compute-heavy endpoint limiter (payrun compute, PDF generation)
 * 5 requests per 5 minutes
 */
function createHeavyLimiter() {
  return rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many compute requests. Please wait before trying again.',
      code: 'COMPUTE_RATE_LIMIT_EXCEEDED',
    },
  });
}

module.exports = { createGeneralLimiter, createAuthLimiter, createHeavyLimiter };
