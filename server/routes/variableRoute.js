const router = require('express').Router();
const variableCtrl = require('../controllers/variableController');
const authenticate = require('../middlewares/authentication');
const { checkIfAdmin } = require('../middlewares/access');

router.post('/', authenticate, checkIfAdmin, variableCtrl.updateVariables);

module.exports = router;
