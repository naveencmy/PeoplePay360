const { Router } = require('express');
const ctrl = require('../../controllers/contract.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createContractSchema, updateContractSchema, contractIdParamSchema } = require('../../models/contract.model');
const { employeeIdParamSchema } = require('../../models/employee.model');

const router = Router();
router.use(authenticate);

router.get('/expiring', ctrl.getExpiringSoon);
router.get('/employee/:id', validate({ params: employeeIdParamSchema }), ctrl.getEmployeeContracts);
router.get('/employee/:id/active', validate({ params: employeeIdParamSchema }), ctrl.getActiveContract);

router.post('/', authorize('ADMIN', 'HR'), validate({ body: createContractSchema }), ctrl.createContract);
router.put('/:id', authorize('ADMIN', 'HR'), validate({ params: contractIdParamSchema, body: updateContractSchema }), ctrl.updateContract);
router.put('/:id/end', authorize('ADMIN', 'HR'), validate({ params: contractIdParamSchema }), ctrl.endContract);

module.exports = router;
