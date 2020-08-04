const {
  Product,
  Package
} = require('../models');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const {
  check,
  validationResult
} = require('express-validator');
const Transaction = require('../models/transaction');
const { createReference } = require('../services/paymentService');
const StripeService = require('../services/stripeService');

module.exports = {
  create: async (req, res) => {
    const result = validationResult(req);
    const hasErrors = !result.isEmpty();
    if (hasErrors) {
      return res
        .status(400)
        .send({
          error: true,
          status_code: 400,
          message: result.array()
        });
    }

    try {
      const packages = await Package.findOne({ name: req.body.packageName })
      if (packages) {
        return res
          .status(400)
          .send(responses.error(400, 'Package already exist'));
      }
      const createdPackage = await Package.create({ name: req.body.packageName, length: req.body.length })
      const endDate = moment( new Date() , "DD-MM-YYYY" ).add( data.cycleNumber , 'days' )
      const productList = req.body.products.map((data) => ({
        ...data, packageID: createdPackage._id, owner: req.user._id, endDate
      }))
      const product = await Product.create(productList);
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Your Product was successfully created.',
            product ,
          ) ,
        );
    } catch (error) {
      return res
        .status(500)
        .send(
          responses.error(500, `Error creating a Product ${error.message}`) ,
        );
    }
  },
  viewProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(400).send(responses.error(400, 'Product not found'));
      } else {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retreived successfully',
              product ,
            ) ,
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a product ${error.message}`));
    }
  },
  listProduct: (req, res) => {
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 20;
    var orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    var order = req.query.order ? req.query.order : 'ASC';
    var ordering = [
      [orderBy, order]
    ];

    Product
      .find({})
      .limit(limit)
      .skip(offset)
      // .sort({
      //   ordering
      // })
      .then(function (product) {
        Product.find({}).exec((err, products) => {
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'Record was retreived successfully',
                products ,
              ) ,
            );
        });
      })
  },
  updateProduct: async (req, res) => {
    try {
      const result = await Product.findByIdAndUpdate(req.params.productId, req.body);
      result.save()
      return res
        .status(200)
        .send(
          responses.success(200, 'Product was updated successfully', result) ,
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.productId);
      if (!product)
        return res
          .status(400)
          .send(
            responses.error(400, 'product not found'));

      else

        return res
          .status(200)
          .send(
            responses.success(200, 'Product was deleted successfully', product)
          );

    } catch (err) {
      return error(res, 500, err.message)
    }
  },
  purchaseProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(404).send(
          responses.error(404, 'Product not found'),
        );
      }

      const newTransaction = await Transaction.create({
        reference: createReference('payment'),
        amount: req.body.amount,
        currency: req.body.currency || 'usd',
        initiatedBy: req.user.id,
        customer: req.body.customer || req.user.id, // this allows admin make a test purchase for a customer on her behalf
        vendor: product.owner,
        transactableType: 'Product',
        transactable: product.id,
        description: `Payment for ${product.name}`,
      });

      const paymentIntent = await StripeService.createPaymentIntent(
        newTransaction, req.user
      ); // TODO: modify this to match when the stripe-service method is completed

      if (paymentIntent && paymentIntent.id) {
        newTransaction.stripePaymentId = paymentIntent.id;

        await newTransaction.save()
      }

      res.status(200).send(
        responses.success(
          200,
          'Product payment initiated successfully',
          {
            clientSecret: paymentIntent.client_secret,
            transactionId: newTransaction.id,
          },
        ),
      );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
};
