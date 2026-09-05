const { Router } = require('express');
const ctrl = require('../../controllers/schedule.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.listSchedules);
router.get('/:id', ctrl.getSchedule);
router.post('/', authorize('ADMIN', 'HR'), ctrl.createSchedule);
router.put('/:id', authorize('ADMIN', 'HR'), ctrl.updateSchedule);

module.exports = router;
