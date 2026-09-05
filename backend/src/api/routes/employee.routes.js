const { Router } = require('express');
const ctrl = require('../../controllers/employee.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema, employeeIdParamSchema } = require('../../models/employee.model');

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate({ query: employeeQuerySchema }), ctrl.listEmployees);
router.get('/stats', ctrl.getStats);
router.get('/by-department', ctrl.getByDepartment);
router.get('/:id', validate({ params: employeeIdParamSchema }), ctrl.getEmployee);

// Admin/HR only
router.post('/', authorize('ADMIN', 'HR'), validate({ body: createEmployeeSchema }), ctrl.createEmployee);
router.put('/:id', authorize('ADMIN', 'HR'), validate({ params: employeeIdParamSchema, body: updateEmployeeSchema }), ctrl.updateEmployee);
router.delete('/:id', authorize('ADMIN', 'HR'), validate({ params: employeeIdParamSchema }), ctrl.archiveEmployee);

module.exports = router;
