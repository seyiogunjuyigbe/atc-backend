const router = require('express').Router();
const { check } = require('express-validator');
const {
  createActivity,
  fetchActivity,
  fetchAllActivities,
  updateActivity,
  deleteActivity,
  upadteActivityPriority,
  fetchHomePageActivities,
} = require('../controllers/activityController');
const authenticate = require('../middlewares/authentication');
const { checkIfAdmin } = require('../middlewares/access');

const validate = require('../middlewares/validate');
const { multiParser } = require('../middlewares/multer');

router.post(
  '/',
  authenticate,
  multiParser.array('attachments', 10),
  [check('title').not().isEmpty().withMessage('Activity title required')],
  validate,
  createActivity
);
router.put(
  '/:activityId',
  authenticate,
  multiParser.array('attachments', 10),
  [check('title').not().isEmpty().withMessage('Activity title required')],
  validate,
  updateActivity
);
router.get('/priority', fetchHomePageActivities);
router.put(
  '/:activityId/priority',
  authenticate,
  checkIfAdmin,
  check('priority').not().isEmpty().withMessage('Priority is required'),
  validate,
  upadteActivityPriority
);
router.get('/', fetchAllActivities);
router.get('/:activityId', fetchActivity);
router.delete('/:activityId', authenticate, deleteActivity);

module.exports = router;
