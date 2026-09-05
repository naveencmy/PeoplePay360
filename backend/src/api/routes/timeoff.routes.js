const { Router } = require('express');
const ctrl = require('../../controllers/timeoff.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createTimeOffSchema, approveRejectSchema, timeOffIdParamSchema } = require('../../models/timeoff.model');

const router = Router();
router.use(authenticate);

router.post('/', validate({ body: createTimeOffSchema }), ctrl.requestTimeOff);
router.get('/', ctrl.listRequests);
router.get('/pending', authorize('ADMIN', 'HR', 'MANAGER'), ctrl.getPending);
router.get('/balance/:id', ctrl.getBalance);
router.put('/:id/approve', authorize('ADMIN', 'HR', 'MANAGER'), validate({ params: timeOffIdParamSchema, body: approveRejectSchema }), ctrl.approveTimeOff);
router.put('/:id/reject', authorize('ADMIN', 'HR', 'MANAGER'), validate({ params: timeOffIdParamSchema, body: approveRejectSchema }), ctrl.rejectTimeOff);
router.put('/:id/cancel', validate({ params: timeOffIdParamSchema }), ctrl.cancelTimeOff);

module.exports = router;
