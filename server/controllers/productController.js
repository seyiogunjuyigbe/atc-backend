const { Product, Package, ProductCycle, Transaction } = require('../models');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const { success, error } = require('../middlewares/response')
const { check, validationResult } = require('express-validator');
const { createReference } = require('../services/paymentService');
const moment = require('moment')
const StripeService = require('../services/stripeService');
const Queryservice = require("../services/queryService")

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
    const { sellingCycle, waitingCycle } = req.body
    try {
      const packages = await Package.findOne({ name: req.body.packageName })
      if (packages) {
        return res
          .status(400)
          .send(responses.error(400, 'Package already exist'));
      }
      const createdPackage = await Package.create({ name: req.body.packageName, length: req.body.length })
      const productList = req.body.products.map((data) => ({
        ...data, package: createdPackage._id,
        owner: req.user._id,
        price: calc(data.price),
        sellingCycle: data.sellingCycle,
        waitingCycle: data.waitingCycle,
        customPrices: data.customPrices.map(price => ({
          range: price.range, prices: calc(price.prices)
        }))
      }))
      const mainProductObject = productList.filter(({ isMainProduct }) => isMainProduct)[0]
      if (!mainProductObject) return res
        .status(500)
        .send(
          responses.error(500, `Error creating a Product No Main product provided`) ,
        );
      const endDate = moment(new Date(), "DD-MM-YYYY").add(req.body.sellingCycle, 'days')
      await Product.create(productList.filter(({ isMainProduct }) => !isMainProduct));
      const mainProductInfo = await Product.create({ ...mainProductObject, sellingCycle, waitingCycle, endDate, startDate: new Date(),  });
      const activeCycle = await ProductCycle.create({ startDate: new Date(), product: mainProductInfo._id, sellingCycle, waitingCycle, endDate, totalSlots: req.body.totalSlots , slotsUsed: req.body.slotsUsed })
      mainProductInfo.activeCycle = activeCycle._id
      await mainProductInfo.save()
      return success(res, 200, "Product created successfully");
    } catch (error) {
      return res
        .status(500)
        .send(
          responses.error(500, `Error creating a Product ${error.message}`) ,
        );
    }
  },
  viewProductCycle: async (req, res) => {
    try {
      const product = await ProductCycle.findOne({ product: req.params.productId })
      if (!product) {
        return res.status(400).send(responses.error(400, 'Product Cycle not found'));
      } else {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retrieved successfully',
              product
            ) ,
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a product ${error.message}`));
    }
  },
  updateSlot: async (req, res) => {
    try {
      const productCycle = await ProductCycle.findOne({product: req.params.productId, status: "active"});
      if (!productCycle) {
        return res.status(400).send(responses.error(400, 'Product not found'));
      }
      if(productCycle.slotsUsed > req.body.totalSlots) {
        return res
          .status(500)
          .send(responses.error(500, 'Product slot cannot be less than slots already purchased'));
      }
      productCycle.totalSlots = req.body.totalSlots
      await productCycle.save();
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was updated successfully'
          ) ,
        );
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a product ${error.message}`));
    }
  },
  viewProduct: async (req, res) => {
    try {
      const product = await Queryservice.findOne(Product, req);
      return success(res, 200, product)
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  listProduct: async (req, res) => {
    try {
      let products = await Queryservice.find(Product, req)
      return success(res, 200, products)
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  updateProduct: async (req, res) => {
    try {
      const result = await Product.findByIdAndUpdate(req.params.productId, {
        ...req.body,
      });
      if (req.body.price) result.price = calc(req.body.price);
      if (req.body.customPrices) {
        if (req.body.customPrices.length >= 1) {
          result.customPrices = req.body.customPrices.map(price => ({
            range: price.range, prices: calc(price.prices)
          }))
        }
      }
      await result.save()
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
        activeCycle: product.activeCycle,
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
    let today = new Date();
    try {
      let products = await Queryservice.find(Product, req, { marketingExpiryDate: { $gte: today } });
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
    vendorPrice: obj.adult,
    childrenPrice: obj.children,
    productAdultPrice: calcPrice(obj.adult),
    freeMembershipDiscountedPrice: Math.round(((calcPrice(obj.adult) / 2) + (calcPrice(obj.adult) * 0.05))) || 0,
    paidMembershipDiscountedPrice: Math.round((calcPrice(obj.adult) / 3) + (calcPrice(obj.adult) * 0.05)) || 0,
    oneOffMembershipFee: 0.21 * obj.adult || 0,
  }
}
