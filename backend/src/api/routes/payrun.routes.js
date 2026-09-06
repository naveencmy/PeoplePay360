const { Router } = require('express');
const ctrl = require('../../controllers/payrun.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createHeavyLimiter } = require('../../middleware/rateLimit.middleware');
const { createPayrunSchema, payrunIdParamSchema, payrunQuerySchema } = require('../../models/payrun.model');

const router = Router();
const heavyLimiter = createHeavyLimiter();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'HR', 'AUDITOR'), validate({ query: payrunQuerySchema }), ctrl.listPayruns);
router.get('/:id', authorize('ADMIN', 'HR', 'AUDITOR'), validate({ params: payrunIdParamSchema }), ctrl.getPayrun);
router.post('/', authorize('ADMIN', 'HR'), validate({ body: createPayrunSchema }), ctrl.createPayrun);
router.delete('/:id', authorize('ADMIN', 'HR'), validate({ params: payrunIdParamSchema }), ctrl.deletePayrun);

// State transitions — rate limited for compute-heavy operations
router.post('/:id/compute', authorize('ADMIN', 'HR'), heavyLimiter, validate({ params: payrunIdParamSchema }), ctrl.computePayrun);
router.put('/:id/validate', authorize('ADMIN', 'HR'), validate({ params: payrunIdParamSchema }), ctrl.validatePayrun);
router.put('/:id/mark-paid', authorize('ADMIN', 'HR'), validate({ params: payrunIdParamSchema }), ctrl.markPaid);
router.put('/:id/archive', authorize('ADMIN', 'HR'), validate({ params: payrunIdParamSchema }), ctrl.archivePayrun);

module.exports = router;
