const { validationResult } = require('express-validator');
const moment = require('moment');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const {
  Product,
  Package,
  ProductCycle,
  Transaction,
  Recommendation,
  Installment,
  PaymentSchedule,
  Membership,
  User,
  WatchNotification,
  Variable,
} = require('../models');
const responses = require('../helper/responses');
const { success, error } = require('../middlewares/response');
const { createReference } = require('../services/paymentService');
const StripeService = require('../services/stripeService');
const Queryservice = require('../services/queryService');
const {
  refundPaymentToWallet,
  createUserWallet,
  refundPaymentToPoints,
} = require('../services/walletService');
const { defaultMembership } = require('../middlewares/membership');
const credential = require('../config/local');

function calcPrice(price, point, value, multiplier) {
  if (price === undefined || Number.isNaN(Number(price) === true)) return 0;
  return Math.round(
    (price + (point / 100) * price + (value / 100) * price) * multiplier
  );
}
function calcRandomPrice(price, values, points, multiplier) {
  if (price === undefined || Number.isNaN(Number(price) === true)) return 0;
  return Math.round(
    (price +
      (points / 100) * price +
      (values[Math.floor(Math.random() * values.length)] / 100) * price) *
      multiplier
  );
}
async function calc(obj) {
  try {
    const variables = await Variable.findOne({ type: 'default' });
    const {
      oneOffMembershipPercent,
      loyaltyPointAllocation,
      productTradingValue,
      productTradingRangeValue,
      productPriceMultiplier,
      productTradingPriceMultiplier,
      transactionFee,
      freeMembershipDiscountDivisor,
      paidMembershipDiscountDivisor,
      annualMembershipFee,
    } = variables;
    return {
      vendorPrice: obj.adult,
      childrenPrice: obj.children,
      productAdultPrice: calcPrice(
        obj.adult,
        loyaltyPointAllocation,
        productTradingValue,
        productPriceMultiplier
      ),
      productChildrenPrice: calcPrice(
        obj.children,
        loyaltyPointAllocation,
        productTradingValue,
        productPriceMultiplier
      ),
      productAdultTradingPrice: calcRandomPrice(
        obj.adult,
        productTradingRangeValue,
        loyaltyPointAllocation,
        productTradingPriceMultiplier
      ),
      productChildrenTradingPrice: calcRandomPrice(
        obj.children,
        productTradingRangeValue,
        loyaltyPointAllocation,
        productTradingPriceMultiplier
      ),
      adultFreeMembershipDiscountedPrice:
        Math.round(
          (calcPrice(
            obj.adult,
            loyaltyPointAllocation,
            productTradingValue,
            productPriceMultiplier
          ) /
            freeMembershipDiscountDivisor) *
            (transactionFee / 100)
        ) || 0,
      childrenFreeMembershipDiscountedPrice:
        Math.round(
          (calcPrice(
            obj.children,
            loyaltyPointAllocation,
            productTradingValue,
            productPriceMultiplier
          ) /
            freeMembershipDiscountDivisor) *
            (transactionFee / 100)
        ) || 0,
      adultPaidMembershipDiscountedPrice:
        Math.round(
          (calcPrice(
            obj.adult,
            loyaltyPointAllocation,
            productTradingValue,
            productPriceMultiplier
          ) /
            paidMembershipDiscountDivisor) *
            (transactionFee / 100)
        ) || 0,
      childrenPaidMembershipDiscountedPrice:
        Math.round(
          (calcPrice(
            obj.children,
            loyaltyPointAllocation,
            productTradingValue,
            productPriceMultiplier
          ) /
            paidMembershipDiscountDivisor) *
            (transactionFee / 100)
        ) || 0,
      adultOneOffMembershipFee:
        (oneOffMembershipPercent / 100) * obj.adult || 0,
      childrenOneOffMembershipFee:
        (oneOffMembershipPercent / 100) * obj.children || 0,
      annualMembershipFee,
    };
  } catch (err) {
    console.log({ err });
    return null;
  }
}
async function fetchWithStats(model, doc, hours) {
  let purchases;
  try {
    let recommendations = await Recommendation.find({
      featureType: model,
      featureId: doc.id,
    });
    const sales = await Transaction.find({
      type: 'payment',
      transactableType: model,
      transactable: doc.id,
      $or: [{ status: 'successful' }, { status: 'settled' }],
    });
    if (hours) {
      purchases = sales.filter(purchase => {
        return (
          Math.round(
            moment.duration(moment().diff(moment(purchase.paidAt))).asHours()
          ) <= Number(hours)
        );
      });
      recommendations = recommendations.filter(recommendation => {
        return (
          Math.round(
            moment
              .duration(moment().diff(moment(recommendation.date)))
              .asHours()
          ) <= Number(hours)
        );
      });
    } else {
      purchases = sales;
    }
    return {
      doc,
      recommendations: recommendations.length,
      purchases: purchases.length,
      sales: sales.length,
    };
  } catch (err) {
    return err;
  }
}

module.exports = {
  create: async (req, res) => {
    const result = validationResult(req);
    const hasErrors = !result.isEmpty();
    if (hasErrors) {
      return res.status(400).send({
        error: true,
        status_code: 400,
        message: result.array(),
      });
    }
    const { sellingCycle, waitingCycle } = req.body;
    try {
      const adminUser = await User.findOne({ role: 'admin' });
      const packages = await Package.findOne({ name: req.body.packageName });
      if (packages) {
        return res
          .status(400)
          .send(responses.error(400, 'Package already exist'));
      }
      const createdPackage = await Package.create({
        name: req.body.packageName,
        length: req.body.length,
      });
      const productList = await Promise.all(
        req.body.products.map(async data => ({
          ...data,
          package: createdPackage._id,
          owner: req.user._id,
          price: await calc(data.price),
          sellingCycle: data.sellingCycle,
          waitingCycle: data.waitingCycle,
          customPrices: await Promise.all(
            data.customPrices.map(async price => ({
              range: price.range,
              prices: await calc(price.prices),
            }))
          ),
        }))
      );
      const mainProductObject = productList.find(
        ({ isMainProduct }) => isMainProduct
      );
      if (!mainProductObject)
        return res
          .status(500)
          .send(
            responses.error(
              500,
              `Error creating a Product No Main product provided`
            )
          );
      const endDate = moment(new Date(), 'DD-MM-YYYY').add(
        req.body.sellingCycle,
        'days'
      );
      await Product.create(...productList);
      const mainProductInfo = await Product.create({
        ...mainProductObject,
        sellingCycle,
        waitingCycle,
        endDate,
        startDate: new Date(),
      });
      const activeCycle = await ProductCycle.create({
        startDate: new Date(),
        product: mainProductInfo._id,
        sellingCycle,
        waitingCycle,
        endDate,
        totalSlots: req.body.totalSlots,
        availableSlots:
          (adminUser && adminUser.availableSlots) || req.body.totalSlots,
      });
      mainProductInfo.activeCycle = activeCycle._id;
      await mainProductInfo.save();
      return success(res, 200, 'Product created successfully');
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a Product ${err.message}`));
    }
  },
  viewProductCycle: async (req, res) => {
    try {
      const product = await ProductCycle.findOne({
        product: req.params.productId,
      });
      if (!product) {
        return res
          .status(400)
          .send(responses.error(400, 'Product Cycle not found'));
      }
      return res
        .status(200)
        .send(
          responses.success(200, 'Record was retrieved successfully', product)
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a product ${err.message}`));
    }
  },
  addToWatchList: async (req, res) => {
    try {
      await WatchNotification.create({
        product: req.params.productId,
        clientId: req.query.clientId,
        claim: req.query.claim,
        type: 'user',
        dayslimit: req.query.dayslimit,
      });
      return res
        .status(200)
        .send(responses.success(200, 'Record was created successfully'));
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a Record ${err.message}`));
    }
  },
  authAddToWatchList: async (req, res) => {
    try {
      await WatchNotification.create({
        product: req.params.productId,
        clientId: req.user._id,
        claim: req.query.claim,
        dayslimit: req.query.dayslimit,
      });
      return res
        .status(200)
        .send(responses.success(200, 'Record was created successfully'));
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a Record ${err.message}`));
    }
  },
  pauseProduct: async (req, res) => {
    try {
      const { status } = req.body;
      if (status !== 'paused' || status !== 'canceled') {
        return res
          .status(500)
          .send(responses.error(500, `Invalid product status`));
      }
      const product = await Product.findOne({ product: req.params.productId });
      if (!product)
        return res.status(500).send(responses.error(404, `Product not found`));
      product.status = status;
      await product.save();
      return res
        .status(200)
        .send(responses.success(200, 'Record was created successfully'));
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a Record ${err.message}`));
    }
  },
  updateSlot: async (req, res) => {
    try {
      const productCycle = await ProductCycle.findOne(
        { product: req.params.productId, status: 'active' },
        { sort: { createdAt: -1 } }
      );
      if (!productCycle) {
        return res.status(400).send(responses.error(400, 'Product not found'));
      }
      if (productCycle.slotsUsed > req.body.totalSlots) {
        return res
          .status(500)
          .send(
            responses.error(
              500,
              'Product slot cannot be less than slots already purchased'
            )
          );
      }
      productCycle.totalSlots = req.body.totalSlots;
      await productCycle.save();
      return res
        .status(200)
        .send(responses.success(200, 'Record was updated successfully'));
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a product ${err.message}`));
    }
  },
  viewProduct: async (req, res) => {
    const { hours } = req.query;
    try {
      const product = await Queryservice.findOne(Product, req);
      product.stats.views += 1;
      await product.save();
      const result = await fetchWithStats('Product', product, hours);
      return success(res, 200, result);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  listProduct: async (req, res) => {
    try {
      const products = await Queryservice.find(Product, req);
      return success(res, 200, products);
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
            range: price.range,
            prices: calc(price.prices),
          }));
        }
      }
      await result.save();
      return res
        .status(200)
        .send(
          responses.success(200, 'Product was updated successfully', result)
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
        return res.status(400).send(responses.error(400, 'product not found'));

      return res
        .status(200)
        .send(
          responses.success(200, 'Product was deleted successfully', product)
        );
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  purchaseProduct: async (req, res) => {
    const {
      adultQty,
      childQty,
      paymentType,
      startDate,
      membershipId,
      paymentTime,
      installments,
      currency,
      customer,
    } = req.body;
    let amount;
    let annualMembership;
    let childAmount;
    let adultAmount;
    let range;
    let purchaseTransaction;
    const done = [];
    let paymentIntent;
    let amountCapturable;
    let spreadFee;
    try {
      const product = await Product.findById(req.params.productId);
      let membership = await Membership.findById(membershipId);
      if (!membership) return error(res, 404, 'Selected membership not found');
      if (membership.cost === 0 && paymentType !== 'one-off')
        return error(res, 400, 'Can only pay one-off for free membership');
      if (!product) {
        return error(res, 404, 'Product not found');
      }
      const user = await User.findById(req.user.id).populate('memberships');
      if (
        paymentType === 'flexi' &&
        (Number(installments) < 2 ||
          Number.isNaN(Number(installments)) === true)
      )
        return error(
          res,
          400,
          'Invalid number of installments for flexi payment'
        );
      if (paymentTime === 'later') {
        if (!startDate || moment.utc(startDate) <= moment.utc())
          return error(res, 400, 'Valid start date required for later payment');
      }
      if (
        moment
          .duration(
            moment
              .utc()
              .add(product.cancellationDaysLimit, 'days')
              .diff(moment.utc().add(installments, 'days'))
          )
          .asDays() < 0
      ) {
        return error(
          res,
          409,
          'Installment cannot exceed product cancellation limit'
        );
      }

      if (product.customPrices.length > 0) {
        range = product.customPrices.find(price => {
          return (
            childQty + adultQty >= Math.min(...price.range) &&
            childQty + adultQty <= Math.max(...price.range)
          );
        });
      }
      if (range) {
        adultAmount = range.prices.productAdultPrice * (adultQty || 0);
        childAmount = range.prices.childrenPrice * (childQty || 0);
      } else {
        childAmount = product.price.childrenPrice * (childQty || 0);
        adultAmount = product.price.productAdultPrice * (adultQty || 0);
      }

      if (paymentTime === 'now') {
        if (paymentType === 'one-off') {
          // check if user has active annual membership
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = childAmount + adultAmount;
          } else {
            amount = childAmount + adultAmount + membership.cost;
          }
          // charge for both membership and product
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            activeCycle: product.activeCycle,
            initiatedBy: customer || user.id,
            customer,
            vendor: product.owner,
            transactableType: 'Product',
            transactable: product.id,
            description: `Payment for (${product.name})`,
            meta: {
              paymentType,
              paymentTime,
              membershipPurchased: membership,
            },
          });
          paymentIntent = await StripeService.createPaymentIntent(
            purchaseTransaction,
            user
          );
          if (paymentIntent && paymentIntent.id) {
            purchaseTransaction.stripePaymentId = paymentIntent.id;
            await purchaseTransaction.save();
          }
          done.push('Payment initiated successfully');
        }
        if (paymentType === 'flexi') {
          // spread product fee only
          spreadFee = (childAmount + adultAmount) / Number(installments);
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = spreadFee;
            amountCapturable = childAmount + adultAmount;
          } else {
            amount = spreadFee + membership.cost;
            amountCapturable = childAmount + adultAmount + membership.cost;
          }
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            activeCycle: product.activeCycle,
            initiatedBy: customer || user.id,
            customer,
            vendor: product.owner,
            transactableType: 'Product',
            transactable: product.id,
            description: `Payment for (${product.name})`,
            meta: {
              paymentType,
              paymentTime,
              membershipPurchased: membership,
            },
          });
          paymentIntent = await StripeService.createPaymentIntent(
            purchaseTransaction,
            user,
            amountCapturable
          );
          if (paymentIntent && paymentIntent.id) {
            purchaseTransaction.stripePaymentId = paymentIntent.id;
          }
          // create installments, set recurrring count to 1 since first installment has been paid
          const installment = await Installment.create({
            user: customer || req.user.id,
            recurringAmount: spreadFee,
            recurrentCount: 1,
            maxNoOfInstallments: installments,
            isCompleted: false,
            lastChargeDate: new Date(), // today
            nextChargeDate: moment.utc().add(30, 'days').startOf('day'), // a month from now,
            transactions: [purchaseTransaction],
            amountCapturable,
            totalPaid: spreadFee,
          });
          purchaseTransaction.installment = installment;
          await purchaseTransaction.save();
          done.push(
            'Membership payment initiated successfully',
            'First product installment charged',
            'Installment schedule created'
          );
        }
      }
      if (paymentTime === 'later') {
        if (paymentType === 'one-off') {
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = 0;
            amountCapturable = childAmount + adultAmount;
          } else {
            amount = membership.cost;
            amountCapturable = childAmount + adultAmount + membership.cost;
          }
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            initiatedBy: user.id,
            customer,
            transactableType: 'Membership',
            transactable: membership.id,
            description: `Payment for membership (${membership.name})`,
          });
          /* this will only create payment if amount is zero, thhe only possible scenario of this is if the user has an active annual membership payment, 
          which implies user has once paid and payment methods have already been saved. Payment intent cannot be created with amount 0,
          an installment is however created for this user
          */
          if (amount > 0) {
            paymentIntent = await StripeService.createPaymentIntent(
              purchaseTransaction,
              user,
              amountCapturable
            );
            if (paymentIntent && paymentIntent.id) {
              purchaseTransaction.stripePaymentId = paymentIntent.id;
            }

            await purchaseTransaction.save();
          }
          // create payment schedule
          const schedule = await PaymentSchedule.create({
            user: customer || req.user.id,
            product,
            activeCycle: product.activeCycle,
            amount,
            chargeDate: moment.utc(startDate).startOf('day'),
            amountCapturable,
          });
          purchaseTransaction.schedule = schedule;
          done.push(
            'Membership payment initiated successfully',
            'Payment schedule created'
          );
        }
        if (paymentType === 'flexi') {
          spreadFee = (childAmount + adultAmount) / Number(installments);
          // charge for membership only
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = 0;
            amountCapturable = childAmount + adultAmount;
          } else {
            amount = membership.cost;
            amountCapturable = childAmount + adultAmount + membership.cost;
          }
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            initiatedBy: user.id,
            customer,
            transactableType: 'Membership',
            transactable: membership.id,
            description: `Payment for membership (${membership.name})`,
          });
          /* this will only create payment if amount is zero, thhe only possible scenario of this is if the user has an active annual membership payment, 
          which implies user has once paid and payment methods have already been saved. Payment intent cannot be created with amount 0,
          an installment is however created for this user
          */
          if (amount > 0) {
            paymentIntent = await StripeService.createPaymentIntent(
              purchaseTransaction,
              user,
              amountCapturable
            );
            if (paymentIntent && paymentIntent.id) {
              purchaseTransaction.stripePaymentId = paymentIntent.id;
            }
          }
          // create installments
          const installment = await Installment.create({
            user: customer || req.user.id,
            recurringAmount: spreadFee,
            recurrentCount: 0,
            maxNoOfInstallments: installments,
            isCompleted: false,
            nextChargeDate: startDate,
            amountCapturable,
            totalPaid: 0,
          });
          purchaseTransaction.installment = installment;
          await purchaseTransaction.save();

          done.push(
            'Membership payment initiated successfully',
            'Installment schedule created'
          );
        }
      }

      const response = { message: done.join(' , ') };
      if (paymentIntent) response.clientSecret = paymentIntent.client_secret;
      return success(res, 200, response);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async updateProductPriority(req, res) {
    const { productId } = req.params;
    const { priority } = req.body;
    if (Number.isNaN(Number(priority)) === true)
      return error(res, 400, 'Priority must be a valid number');
    try {
      const product = await Product.findById(productId);
      product.set({ marketingPriority: priority });
      await product.save();
      return success(res, 200, product);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchHomePageProducts(req, res) {
    let query = {};
    if (req.query.days) {
      query = {
        marketingExpiryDate: {
          $lte: new Date(Date.now() + req.query.days * 24 * 60 * 60 * 1000),
        },
      };
      delete req.query.days;
      // query.marketingExpiryDate = moment(new Date(), 'DD-MM-YYYY').add(req.query.days,'days');
    }
    try {
      const products = await Queryservice.find(Product, req, query);
      return success(res, 200, products);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async refundProductPayment(req, res) {
    const { refundOption } = req.body;

    try {
      const user = await User.findById(req.user.id);
      const transactions = await Transaction.find({
        type: 'payment',
        transactable: req.params.productId,
        transactableType: 'Product',
        customer: req.user.id,
      });
      if (transactions.length === 0)
        return error(
          res,
          400,
          'Sorry, no refundable transaction found for this product'
        );
      const transaction = transactions.find(tr => {
        return tr.status === 'successful' && moment().isBefore(tr.settleDate);
      });
      if (!transaction) {
        return error(
          res,
          400,
          'Sorry, no refundable transaction found for this product'
        );
      }

      let refund;
      if (refundOption === 'wallet') {
        refund = await refundPaymentToWallet(user, transaction);
      } else if (refundOption === 'points') {
        refund = await refundPaymentToPoints(user, transaction);
      }
      return success(res, 200, refund);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async purchaseProductWithoutAuth(req, res) {
    const {
      email,
      adultQty,
      childQty,
      paymentType,
      startDate,
      membershipId,
      paymentTime,
      installments,
      currency,
      customer,
      password,
    } = req.body;
    let amount;
    let annualMembership;
    let childAmount;
    let adultAmount;
    let range;
    let purchaseTransaction;
    const done = [];
    let paymentIntent;
    let amountCapturable;
    let spreadFee;
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return error(res, 404, 'Product not found');
      }
      // register user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return error(
          res,
          400,
          'An account with similar credentials already exists'
        );
      }
      const newUser = await User.create({
        ...req.body,
        password:
          password || customAlphabet('ABCDEFGHJKLMNpqrstuvwxyz23456789', 8),
        token: uuidv1(),
        isActive: false,
        lastLoginAt: new Date(),
      });
      if (newUser) {
        const customerDetails = await StripeService.createCustomer(newUser);
        if (customerDetails && customerDetails.id) {
          newUser.stripeCustomerId = customerDetails.id;
        }
        newUser.memberships.push(await defaultMembership());
        newUser.wallet = await createUserWallet();
        await newUser.save();
      }
      const token = jwt.sign(
        {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
        credential.jwtSecret,
        {
          expiresIn: 604800, // expires in 7 days
        }
      );
      let membership = await Membership.findById(membershipId);
      if (!membership) return error(res, 404, 'Selected membership not found');
      if (membership.cost === 0 && paymentType !== 'one-off')
        return error(res, 400, 'Can only pay one-off for free membership');

      const user = await User.findById(req.user.id).populate('memberships');
      if (
        paymentType === 'flexi' &&
        (Number(installments) < 2 ||
          Number.isNaN(Number(installments)) === true)
      )
        return error(
          res,
          400,
          'Invalid number of installments for flexi payment'
        );
      if (paymentTime === 'later') {
        if (!startDate || moment.utc(startDate) <= moment.utc())
          return error(res, 400, 'Valid start date required for later payment');
      }
      if (
        moment
          .duration(
            moment
              .utc()
              .add(product.cancellationDaysLimit, 'days')
              .diff(moment.utc().add(installments, 'days'))
          )
          .asDays() < 0
      ) {
        return error(
          res,
          409,
          'Installment cannot exceed product cancellation limit'
        );
      }
      if (!product) {
        return error(res, 404, 'Product not found');
      }
      if (product.customPrices.length > 0) {
        range = product.customPrices.find(price => {
          return (
            childQty + adultQty >= Math.min(...price.range) &&
            childQty + adultQty <= Math.max(...price.range)
          );
        });
      }
      if (range) {
        console.log({ range });
        adultAmount = range.prices.productAdultPrice * (adultQty || 0);
        childAmount = range.prices.childrenPrice * (childQty || 0);
      } else {
        console.log({ range });
        childAmount = product.price.childrenPrice * (childQty || 0);
        adultAmount = product.price.productAdultPrice * (adultQty || 0);
      }
      if (paymentTime === 'now') {
        if (paymentType === 'one-off') {
          // check if user has active annual membership
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = childAmount + adultAmount;
          } else {
            amount = childAmount + adultAmount + membership.cost;
          }
          // charge for both membership and product
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            activeCycle: product.activeCycle,
            initiatedBy: customer || user.id,
            customer,
            vendor: product.owner,
            transactableType: 'Product',
            transactable: product.id,
            description: `Payment for (${product.name})`,
            meta: {
              paymentType,
              paymentTime,
              membershipPurchased: membership,
            },
          });
          paymentIntent = await StripeService.createPaymentIntent(
            purchaseTransaction,
            user
          );
          if (paymentIntent && paymentIntent.id) {
            purchaseTransaction.stripePaymentId = paymentIntent.id;
            await purchaseTransaction.save();
          }
          done.push('Payment initiated successfully');
        }
        if (paymentType === 'flexi') {
          // spread product fee only
          spreadFee = (childAmount + adultAmount) / Number(installments);
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = spreadFee;
            amountCapturable = childAmount + adultAmount;
          } else {
            amount = spreadFee + membership.cost;
            amountCapturable = childAmount + adultAmount + membership.cost;
          }
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            activeCycle: product.activeCycle,
            initiatedBy: customer || user.id,
            customer,
            vendor: product.owner,
            transactableType: 'Product',
            transactable: product.id,
            description: `Payment for (${product.name})`,
            meta: {
              paymentType,
              paymentTime,
              membershipPurchased: membership,
            },
          });
          paymentIntent = await StripeService.createPaymentIntent(
            purchaseTransaction,
            user,
            amountCapturable
          );
          if (paymentIntent && paymentIntent.id) {
            purchaseTransaction.stripePaymentId = paymentIntent.id;
          }
          // create installments, set recurrring count to 1 since first installment has been paid
          const installment = await Installment.create({
            user: customer || req.user.id,
            recurringAmount: spreadFee,
            recurrentCount: 1,
            maxNoOfInstallments: installments,
            isCompleted: false,
            lastChargeDate: new Date(), // today
            nextChargeDate: moment.utc().add(30, 'days').startOf('day'), // a month from now,
            transactions: [purchaseTransaction],
            amountCapturable,
          });
          purchaseTransaction.installment = installment;
          await purchaseTransaction.save();
          done.push(
            'Membership payment initiated successfully',
            'First product installment charged',
            'Installment schedule created'
          );
        }
      }
      if (paymentTime === 'later') {
        if (paymentType === 'one-off') {
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = 0;
            amountCapturable = childAmount + adultAmount;
          } else {
            amount = membership.cost;
            amountCapturable = childAmount + adultAmount + membership.cost;
          }
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            initiatedBy: user.id,
            customer,
            transactableType: 'Membership',
            transactable: membership.id,
            description: `Payment for membership (${membership.name})`,
          });
          /* this will only create payment if amount is zero, thhe only possible scenario of this is if the user has an active annual membership payment, 
          which implies user has once paid and payment methods have already been saved. Payment intent cannot be created with amount 0,
          an installment is however created for this user
          */
          if (amount > 0) {
            paymentIntent = await StripeService.createPaymentIntent(
              purchaseTransaction,
              user,
              amountCapturable
            );
            if (paymentIntent && paymentIntent.id) {
              purchaseTransaction.stripePaymentId = paymentIntent.id;
            }

            await purchaseTransaction.save();
          }
          // create payment schedule
          const schedule = await PaymentSchedule.create({
            user: customer || req.user.id,
            product,
            activeCycle: product.activeCycle,
            amount,
            chargeDate: moment.utc(startDate).startOf('day'),
            amountCapturable,
          });
          purchaseTransaction.schedule = schedule;
          done.push(
            'Membership payment initiated successfully',
            'Payment schedule created'
          );
        }
        if (paymentType === 'flexi') {
          spreadFee = (childAmount + adultAmount) / Number(installments);
          // charge for membership only
          annualMembership =
            user.memberships.find(x => {
              return x.type === 'annual';
            }) && moment.utc(user.membershipExpiry).isAfter(moment.utc());
          if (annualMembership) {
            // user does not need to pay for new mwmbership
            membership = null;
            console.log({ annualMembership });
            amount = 0;
            amountCapturable = childAmount + adultAmount;
          } else {
            amount = membership.cost;
            amountCapturable = childAmount + adultAmount + membership.cost;
          }
          purchaseTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount,
            currency: currency || 'usd',
            initiatedBy: user.id,
            customer,
            transactableType: 'Membership',
            transactable: membership.id,
            description: `Payment for membership (${membership.name})`,
          });
          /* this will only create payment if amount is zero, thhe only possible scenario of this is if the user has an active annual membership payment, 
          which implies user has once paid and payment methods have already been saved. Payment intent cannot be created with amount 0,
          an installment is however created for this user
          */
          if (amount > 0) {
            paymentIntent = await StripeService.createPaymentIntent(
              purchaseTransaction,
              user,
              amountCapturable
            );
            if (paymentIntent && paymentIntent.id) {
              purchaseTransaction.stripePaymentId = paymentIntent.id;
            }
          }
          // create installments
          const installment = await Installment.create({
            user: customer || req.user.id,
            recurringAmount: spreadFee,
            recurrentCount: 0,
            maxNoOfInstallments: installments,
            isCompleted: false,
            nextChargeDate: startDate,
            amountCapturable,
          });
          purchaseTransaction.installment = installment;
          await purchaseTransaction.save();

          done.push(
            'Membership payment initiated successfully',
            'Installment schedule created'
          );
        }
      }
      const response = { message: done.join(' , ') };
      if (paymentIntent) response.clientSecret = paymentIntent.client_secret;
      return success(res, 200, { response, token });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
