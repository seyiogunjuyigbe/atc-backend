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
productRoute.post('/add-to-watch/:productId', productCrl.addToWatchList);
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
  productCrl.purchaseProduct
);
productRoute.post(
  '/:productId/purchase/guest',
  [
    check('email').isEmail().withMessage('Email required'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be 8 characters or more'),
  ],
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
