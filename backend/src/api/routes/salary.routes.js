const { Router } = require('express');
const ctrl = require('../../controllers/salary.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { createStructureSchema, updateStructureSchema, createRuleSchema, updateRuleSchema, structureIdParamSchema, ruleIdParamSchema } = require('../../models/salary.model');

const router = Router();
router.use(authenticate);

// Structures
router.get('/', ctrl.listStructures);
router.get('/:id', validate({ params: structureIdParamSchema }), ctrl.getStructure);
router.post('/', authorize('ADMIN', 'HR'), validate({ body: createStructureSchema }), ctrl.createStructure);
router.put('/:id', authorize('ADMIN', 'HR'), validate({ params: structureIdParamSchema, body: updateStructureSchema }), ctrl.updateStructure);
router.delete('/:id', authorize('ADMIN', 'HR'), validate({ params: structureIdParamSchema }), ctrl.deleteStructure);
router.post('/:id/clone', authorize('ADMIN', 'HR'), validate({ params: structureIdParamSchema }), ctrl.cloneStructure);

// Rules (nested under structure)
router.get('/:id/rules', validate({ params: structureIdParamSchema }), ctrl.getRules);
router.post('/:id/rules', authorize('ADMIN', 'HR'), validate({ params: structureIdParamSchema, body: createRuleSchema }), ctrl.addRule);
router.put('/:id/rules/:ruleId', authorize('ADMIN', 'HR'), validate({ params: ruleIdParamSchema, body: updateRuleSchema }), ctrl.updateRule);
router.delete('/:id/rules/:ruleId', authorize('ADMIN', 'HR'), validate({ params: ruleIdParamSchema }), ctrl.deleteRule);

module.exports = router;
