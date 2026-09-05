const { verifyAccessToken } = require('../config/jwt');

// ─────────────────────────────────────────────────────────────────────────────
// Authentication & Authorization Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JWT authentication middleware
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the decoded user to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware factory
 * Usage: authorize('ADMIN', 'HR') — only ADMIN or HR roles can proceed
 * @param {...string} allowedRoles - Roles that are permitted
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Optional authentication — attaches user if token present, but doesn't block
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      // Token invalid — proceed without user context
    }
  }

  next();
}

// Predefined role constants
const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
});

module.exports = { authenticate, authorize, optionalAuth, ROLES };
