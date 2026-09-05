const { Router } = require('express');
const ctrl = require('../../controllers/payslip.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { payslipIdParamSchema } = require('../../models/payslip.model');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.listPayslips);
router.get('/:id', validate({ params: payslipIdParamSchema }), ctrl.getPayslip);
router.get('/:id/pdf', validate({ params: payslipIdParamSchema }), ctrl.downloadPDF);
router.post('/:id/email', validate({ params: payslipIdParamSchema }), ctrl.emailPayslip);

// Batch operations (by payrun)
router.get('/payrun/:payrunId', ctrl.getPayslipsByPayrun);
router.post('/payrun/:payrunId/email', authorize('ADMIN', 'HR'), ctrl.bulkEmailPayslips);

// Employee payslip history
router.get('/employee/:employeeId', ctrl.getPayslipsByEmployee);

module.exports = router;
