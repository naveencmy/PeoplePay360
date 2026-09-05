const { Router } = require('express');
const ctrl = require('../../controllers/attendance.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { checkInSchema, checkOutSchema, attendanceSummaryQuerySchema, bulkAttendanceSchema } = require('../../models/attendance.model');

const router = Router();
router.use(authenticate);

router.post('/check-in', validate({ body: checkInSchema }), ctrl.checkIn);
router.post('/check-out', validate({ body: checkOutSchema }), ctrl.checkOut);
router.get('/today', ctrl.getTodayStatus);
router.get('/summary', validate({ query: attendanceSummaryQuerySchema }), ctrl.getSummary);
router.get('/anomalies', authorize('ADMIN', 'HR', 'MANAGER'), ctrl.getAnomalies);
router.get('/', ctrl.getRecords);
router.get('/:id', ctrl.getRecords);
router.post('/bulk', authorize('ADMIN', 'HR'), validate({ body: bulkAttendanceSchema }), ctrl.bulkImport);

module.exports = router;
