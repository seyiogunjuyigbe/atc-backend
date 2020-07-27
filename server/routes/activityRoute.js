const router = require("express").Router();
const {
    createActivity,
    fetchActivity,
    fetchAllActivities,
    updateActivity,
    deleteActivity
} = require("../controllers/activityController");
const {
    check
} = require('express-validator');
const authenticate = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/', authenticate, [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('description').not().isEmpty().withMessage('Package description required'),
    check('features').isArray({
        min: 1
    }).withMessage('features array required'),
    check('price').not().isEmpty().withMessage('Package price required')
], validate, createActivity);
router.put('/:activityId', authenticate, [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('description').not().isEmpty().withMessage('Package description required'),
    check('features').isArray({
        min: 1
    }).withMessage('features array required'),
    check('price').not().isEmpty().withMessage('Package price required')
], validate, updateActivity);
router.get('/', fetchAllActivities)
router.get('/:activityId', fetchActivity)
router.delete('/:packaageId', authenticate, deleteActivity)

module.exports = router;