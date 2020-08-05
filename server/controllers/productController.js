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
      const productList = req.body.products.map((data) => ({
        ...data, packageID: createdPackage._id, owner: req.user._id, price: { adult: data.adultPrice, children: data.childrenPrice, actual: calcPrice(data.adultPrice) }
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
              { product, prices: calc(product) }
            ) ,
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a product ${error.message}`));
    }
  },
  listProduct: async (req, res) => {
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 20;
    var orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    var order = req.query.order ? req.query.order : 'asc';
    var ordering = [
      [orderBy, order]
    ];
    try {
      let products = await Product
        .find({})
        .limit(limit)
        .skip(offset)
      // .sort({
      //   ordering
      // })

      await Product.countDocuments().exec()
      let result = []
      products.forEach(product => {
        result.push({ product, prices: calc(product) })
      })
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was retreived successfully',
            result ,
          ) ,
        );

    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }


  },
  updateProduct: async (req, res) => {
    try {
      const result = await Product.findByIdAndUpdate(req.params.productId, { ...req.body, price: { adult: req.body.adultPrice, children: req.body.childrenPrice, actual: calcPrice(req.body.adultPrice) } });
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
  async updateProductPriority(req, res) {
    const { productId } = req.params;
    const { priority } = req.body;
    if (isNaN(Number(priority)) == true) return error(res, 400, 'Priority must be a valid number')
    try {
      let product = await Product.findById(productId);
      product.set({ marketingPriority: priority });
      await product.save();
      return success(res, 200, product)
    } catch (err) {
      return error(res, 500, err.message)
    }
  },
  async fetchHomePageProducts(req, res) {
    const { sort, category } = req.query;
    if (sort && sort !== "asc" && sort !== "desc") return error(res, 400, 'Sort can only be "asc" or "desc"')
    let today = new Date()
    try {
      let products = await Product.find({ marketingExpiryDate: { $gte: today }, $or: [{}] }).sort({ marketingPriority: sort });
      if (category) products = products.filter(x => {
        return x.sightCategories.includes(category)
      })
      return success(res, 200, products)
    } catch (err) {
      return error(res, 500, err.message)
    }
  }
};
function calcPrice(adult) {
  if (adult == undefined || isNaN(Number(adult) == true)) return 0
  else {
    return Math.round(((adult + (0.06 * adult) + (0.04 * adult)) * 4))
  }
}
function calc(obj) {
  return {
    vendorPrice: obj.price.adult,
    childrenPrice: obj.price.children,
    productPrice: obj.price.actual,
    freeMembershipDiscountedPrice: Math.round(((obj.price.actual / 2) + (obj.price.actual * 0.05))),
    paidMembershipDiscountedPrice: Math.round((obj.price.actual / 3) + (obj.price.actual * 0.05)),
    oneOffMembershipFee: 0.21 * obj.price.adult,
  }
}