const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const { generateTokenPair, verifyRefreshToken } = require('../config/jwt');
const { AppError } = require('../middleware/error.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Auth Service — JWT authentication, bcrypt hashing, RBAC
// ─────────────────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

/**
 * Register a new user
 */
async function register({ email, password, role, first_name, last_name }) {
  // Check if email already exists
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw AppError.conflict('Email already registered');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await userRepo.create({
    email: email.toLowerCase(),
    password_hash,
    role: role || 'EMPLOYEE',
    first_name,
    last_name,
    is_active: true,
  });

  // Generate tokens
  const tokens = generateTokenPair(user);

  // Store refresh token
  await userRepo.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

/**
 * Login with email and password
 */
async function login({ email, password }) {
  // Find user
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  if (!user.is_active) {
    throw AppError.unauthorized('Account is deactivated. Contact your administrator.');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokenPair(user);

  // Store refresh token
  await userRepo.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

/**
 * Refresh access token using refresh token
 */
async function refreshToken(token) {
  try {
    const decoded = verifyRefreshToken(token);
    const user = await userRepo.findById(decoded.userId);

    if (!user || !user.is_active) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    // Generate new token pair
    const tokens = generateTokenPair(user);
    await userRepo.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  } catch (error) {
    if (error.isOperational) throw error;
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}

/**
 * Change password
 */
async function changePassword(userId, { old_password, new_password }) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw AppError.notFound('User');
  }

  // Verify old password
  const isValid = await bcrypt.compare(old_password, user.password_hash);
  if (!isValid) {
    throw AppError.unauthorized('Current password is incorrect');
  }

  // Hash new password
  const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await userRepo.update(userId, { password_hash });

  return { message: 'Password changed successfully' };
}

/**
 * Get current user profile
 */
async function getProfile(userId) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw AppError.notFound('User');
  }
  return sanitizeUser(user);
}

/**
 * Logout (clear refresh token)
 */
async function logout(userId) {
  await userRepo.clearRefreshToken(userId);
  return { message: 'Logged out successfully' };
}

/**
 * Remove sensitive fields from user object
 */
function sanitizeUser(user) {
  const { password_hash, refresh_token, ...safe } = user;
  return safe;
}

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
  getProfile,
  logout,
};
