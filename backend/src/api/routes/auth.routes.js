const { Router } = require('express');
const ctrl = require('../../controllers/auth.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createAuthLimiter } = require('../../middleware/rateLimit.middleware');
const { registerSchema, loginSchema, changePasswordSchema, refreshTokenSchema } = require('../../models/user.model');

const router = Router();
const authLimiter = createAuthLimiter();

// Public routes
router.post('/register', authLimiter, validate({ body: registerSchema }), ctrl.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), ctrl.login);
router.post('/refresh', validate({ body: refreshTokenSchema }), ctrl.refreshToken);

// Protected routes
router.get('/users', authenticate, authorize('ADMIN', 'HR'), ctrl.listUsers);
router.put('/users/:id', authenticate, authorize('ADMIN'), ctrl.updateUser);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), ctrl.changePassword);
router.get('/profile', authenticate, ctrl.getProfile);
router.post('/logout', authenticate, ctrl.logout);

module.exports = router;
