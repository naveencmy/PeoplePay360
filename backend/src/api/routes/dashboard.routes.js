const { Router } = require('express');
const ctrl = require('../../controllers/dashboard.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'HR', 'MANAGER', 'AUDITOR'));

router.get('/kpis', ctrl.getKPIs);
router.get('/attendance-health', ctrl.getAttendanceHealth);
router.get('/salary-by-department', ctrl.getSalaryByDepartment);
router.get('/trend', ctrl.getMonthlyTrend);
router.get('/attendance-trend', ctrl.getAttendanceTrend);
router.get('/timeoff-summary', ctrl.getTimeOffSummary);
router.get('/status-counts', ctrl.getPayrollStatusCounts);
router.post('/refresh-cache', authorize('ADMIN'), ctrl.refreshCache);

module.exports = router;
