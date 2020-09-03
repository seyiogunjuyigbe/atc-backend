const express = require('express');
const { check } = require('express-validator');

const productCrl = require('../controllers/productController');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authentication');
const { checkIfAdmin } = require('../middlewares/access');

const productRoute = express.Router();

productRoute.post('/', authenticate, productCrl.create);
productRoute.get('/priority', productCrl.fetchHomePageProducts);
productRoute.get('/', productCrl.listProduct);
productRoute.put('/:productId', authenticate, productCrl.updateProduct);
productRoute.get('/:productId', productCrl.viewProduct);
productRoute.put('/slots/:productId', productCrl.updateSlot);
productRoute.put('/update-product-status/:productId', productCrl.pauseProduct);
productRoute.post('/add-to-watch/:productId', productCrl.addToWatchList);
productRoute.post(
  '/add-to-watch-for-user/:productId',
  authenticate,
  productCrl.addToWatchList
);
productRoute.get('/product_cycle/:productId', productCrl.viewProductCycle);
productRoute.put(
  '/:productId/priority',
  authenticate,
  checkIfAdmin,
  check('priority').not().isEmpty().withMessage('Priority is required'),
  validate,
  productCrl.updateProductPriority
);

productRoute.post('/', authenticate, productCrl.create);
productRoute.get('/priority', productCrl.fetchHomePageProducts);
productRoute.get('/', productCrl.listProduct);
productRoute.put('/:productId', authenticate, productCrl.updateProduct);
productRoute.get('/:productId', productCrl.viewProduct);
productRoute.put('/slots/:productId', productCrl.updateSlot);
productRoute.post(
  '/add-to-watch-for-user/:productId',
  productCrl.authAddToWatchList
);
productRoute.get('/priority', productCrl.fetchHomePageProducts);
productRoute.get('/product_cycle/:productId', productCrl.viewProductCycle);
productRoute.put(
  '/:productId/priority',
  authenticate,
  checkIfAdmin,
  check('priority').not().isEmpty().withMessage('Priority is required'),
  validate,
  productCrl.updateProductPriority
);

// productRoute.delete("/product/:productId",  productCrl.deleteProduct);
productRoute.post(
  '/:productId/purchase',
  authenticate,
  [
    check('adultQty').not().isEmpty().withMessage('Adult quantity required'),
    check('childQty').not().isEmpty().withMessage('Child quantity required'),
    check('paymentType')
      .not()
      .isEmpty()
      .withMessage('Payment type values: one-off, flexi'),
    check('paymentTime')
      .not()
      .isEmpty()
      .withMessage('Payment time values: now, later'),
    check('installments')
      .not()
      .isEmpty()
      .withMessage('No of installments required, value should be 1 if one-off'),
    check('membershipId').not().isEmpty().withMessage('Membership ID required'),
  ],
  validate,
  productCrl.purchaseProduct
);
productRoute.post(
  '/:productId/purchase/guest',
  [
    check('email').isEmail().withMessage('Email required'),
    check('adultQty').not().isEmpty().withMessage('Adult quantity required'),
    check('childQty').not().isEmpty().withMessage('Child quantity required'),
    check('paymentType')
      .not()
      .isEmpty()
      .withMessage('Payment type values: one-off, flexi'),
    check('paymentTime')
      .not()
      .isEmpty()
      .withMessage('Payment time values: now, later'),
    check('membershipId').not().isEmpty().withMessage('Membership ID required'),
    check('installments')
      .not()
      .isEmpty()
      .withMessage('No of installments required, value should be 1 if one-off'),
  ],
  validate,
  productCrl.purchaseProductWithoutAuth
);

productRoute.post(
  '/:productId/refund',
  authenticate,
  check('refundOption')
    .isIn(['wallet', 'points'])
    .withMessage('Invalid refund option'),

  validate,
  productCrl.refundProductPayment
);

module.exports = productRoute;
