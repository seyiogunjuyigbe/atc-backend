const router = require('express').Router();
const { check } = require('express-validator');
const recomCtrl = require('../controllers/recommendation');
const authenticate = require('../middlewares/authentication');
const validate = require('../middlewares/validate');
const models = require('../models');

router.post(
  '/',
  authenticate,
  [
    check('featureType')
      .isIn(Object.keys(models))
      .withMessage(
        `Specify model which recommendation is for: ${Object.keys(models).join(
          ','
        )}`
      ),
    check('featureId').not().isEmpty().withMessage('Required field'),
  ],
  validate,
  recomCtrl.reccomendFeature
);
router.get('/', recomCtrl.fetchRecommendations);
module.exports = router;
