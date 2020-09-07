const router = require('express').Router();
const variableCtrl = require('../controllers/variableController');
const authenticate = require('../middlewares/authentication');
const { checkIfAdmin } = require('../middlewares/access');

router.post('/', authenticate, checkIfAdmin, variableCtrl.createVariables);
router.put(
  '/:variableType',
  authenticate,
  checkIfAdmin,
  variableCtrl.updateVariables
);
router.get('/', authenticate, variableCtrl.fetchAllVariables);
router.get(
  '/:variableType',
  authenticate,
  variableCtrl.fetchSingleVariableType
);

module.exports = router;
