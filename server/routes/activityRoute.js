const router = require("express").Router();
const {
    createActivity,
    fetchActivity,
    fetchAllActivities,
    updateActivity,
    deleteActivity, upadteActivityPriority, fetchActivitiesByPriority, fetchHomePageActivities
} = require("../controllers/activityController");
const {
    check
} = require('express-validator');
const authenticate = require('../middlewares/authentication');
const { checkIfAdmin, checkIfVendor } = require('../middlewares/access')

const validate = require('../middlewares/validate');
const {
    multiParser
} = require('../middlewares/multer');

router.post('/', authenticate, multiParser.array("attachments", 10), [
    check('title').not().isEmpty().withMessage('Activity title required'),
    check('description').not().isEmpty().withMessage('Description required'),
    check('hasAccomodation').isBoolean().withMessage('Field must be a boolean'),
    check('hasMeals').isBoolean().withMessage('Field must be a boolean'),
    check('route').isIn(['start', 'end', 'day']).withMessage('Valid route values: (start,end, day)'),
], validate, createActivity);
router.put('/:activityId', authenticate, multiParser.array("attachments", 10), [
    check('title').not().isEmpty().withMessage('Activity title required'),
    check('description').not().isEmpty().withMessage('Description required'),
    check('hasAccomodation').isBoolean().withMessage('Field must be a boolean'),
    check('hasMeals').isBoolean().withMessage('Field must be a boolean'),
    check('route').isIn(['start', 'end', 'day']).withMessage('Valid route values: (start,end, day)')
], validate, updateActivity);
router.get('/priority', fetchHomePageActivities)
router.put('/:activityId/priority', authenticate, checkIfAdmin, check('priority').not().isEmpty().withMessage('Priority is required'),
    validate, upadteActivityPriority)
router.get('/', fetchAllActivities)
router.get('/:activityId', fetchActivity)
router.delete('/:activityId', authenticate, deleteActivity)

module.exports = router;