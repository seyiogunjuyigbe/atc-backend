const router = require('express').Router();
const { check } = require('express-validator');
const {
  createPackage,
  updatePackage,
  fetchAllPackages,
  fetchPackage,
  deletePackage,
  addProductToPackage,
} = require('../controllers/packageController');
const authenticate = require('../middlewares/authentication');
const validate = require('../middlewares/validate');

router.post(
  '/',
  authenticate,
  [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('length').not().isEmpty().withMessage('Package length required'),
  ],
  validate,
  createPackage
);
router.put(
  '/:packageId',
  authenticate,
  [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('length').not().isEmpty().withMessage('Package length required'),
  ],
  validate,
  updatePackage
);
router.put(
  '/:packageId/add-product',
  authenticate,
  [check('productId').not().isEmpty().withMessage('Product ID required')],
  validate,
  addProductToPackage
);
router.get('/', fetchAllPackages);
router.get('/:packageId', fetchPackage);
router.delete('/:packageId', authenticate, deletePackage);

module.exports = router;
