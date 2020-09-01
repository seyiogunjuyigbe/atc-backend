const { check, validationResult } = require('express-validator');
const { Membership, User, Transaction } = require('../models/index');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const { success, error } = require('../middlewares/response');
const { createReference } = require('../services/paymentService');
const StripeService = require('../services/stripeService');

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

    try {
      // check if it exist
      const membership = await Membership.findOne({
        name: req.body.name,
      });
      if (!membership) {
        const memberships = await Membership.create({
          ...req.body,
          createdBy: req.user.id,
        });
        if (memberships) {
          memberships.save();
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'Your Membership was successfully created.',
                memberships
              )
            );
        }
        return res
          .status(400)
          .send(responses.error(400, 'Unable to create Membership'));
      }
      return res
        .status(201)
        .send(
          responses.error(
            201,
            'membership with similar credentials already exists'
          )
        );
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a user ${error.message}`));
    }
  },
  viewMembership: async (req, res) => {
    try {
      const membership = await Membership.findById(req.params.membershipId);
      if (!membership) {
        return res
          .status(400)
          .send(responses.error(400, 'Membership not found'));
      }
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was retreived successfully',
            membership
          )
        );
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a user ${error.message}`));
    }
  },
  listMembership: (req, res) => {
    const offset = req.query.offset ? req.query.offset : 0;
    const limit = req.query.limit ? req.query.limit : 20;
    const orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    const order = req.query.order ? req.query.order : 'ASC';
    const ordering = [[orderBy, order]];

    Membership.find({})
      .limit(limit)
      .skip(offset)
      // .sort({
      //   ordering
      // })
      .then(function (membership) {
        Membership.find({}).exec((err, memberships) => {
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'Record was retreived successfully',
                memberships
              )
            );
        });
      });
  },
  updateMembership: async (req, res) => {
    try {
      const result = await Membership.findByIdAndpdate(
        req.params.membershipId,
        req.body
      );
      result.save();
      return res
        .status(200)
        .send(
          responses.success(200, 'Membership was updated successfully', result)
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteMembership: async (req, res) => {
    try {
      const membership = await Membership.findByIdAndDelete(
        req.params.membershipId
      );
      if (!membership)
        return res
          .status(400)
          .send(responses.error(400, 'Membership not found'));

      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Membership was deleted successfully',
            membership
          )
        );
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async purchaseMembership(req, res) {
    let subscription;
    try {
      const membership = await Membership.findById(req.params.membershipId);
      if (!membership) {
        return error(res, 404, 'Membership not found');
      }
      if (membership.type == 'default') {
        return error(res, 409, 'User already subscribed to free membership');
      }
      const user = await User.findById(req.user.id).populate('memberships');
      const { memberships } = user;
      const checkIfFree = memberships.find(x => {
        return x.type == 'default';
      });
      const checkIfOneOff = memberships.filter(x => {
        return x.type == 'one-off';
      });
      const checkIfAnnual = memberships.find(x => {
        return x.type == 'annual';
      });
      if (checkIfFree) {
        // if current plan is free, remove free from array and overrride with plan
        subscription = membership;
      } else if (checkIfOneOff) {
        // if  plan is a one-off membrship and current plans are one-off membeships, add membership to array;
        if (membership.type == 'one-off' || membership.type == 'annual')
          subscription = membership;
        else {
          return error(
            res,
            409,
            'User already subscribed to one-off membership'
          );
        }
      }
      if (checkIfAnnual) {
        if (membership.type == 'annual') {
          subscription = membership;
        } else {
          return error(
            res,
            409,
            'User already subscribed to annual membership'
          );
        }
      } else {
        subscription = membership;
      }
      const newTransaction = await Transaction.create({
        reference: createReference('payment'),
        type: 'subscription',
        amount: subscription.cost,
        currency: req.body.currency || 'usd',
        initiatedBy: req.user.id,
        customer: req.body.customer || req.user.id,
        transactableType: 'Membership',
        transactable: subscription.id,
        description: `Payment for ${subscription.name}`,
      });

      const paymentIntent = await StripeService.createPaymentIntent(
        newTransaction,
        req.user
      );

      if (paymentIntent && paymentIntent.id) {
        newTransaction.stripePaymentId = paymentIntent.id;

        await newTransaction.save();
      }
      return success(res, 200, {
        message: 'Membership payment initiated successfully',
        clientSecret: paymentIntent.client_secret,
        transactionId: newTransaction.id,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async refundMembership(req, res) {
    const { membershipId } = req.params;
    const { customerId } = req.body;
    if (customerId && req.user.role !== 'admin')
      return error(res, 401, 'Unauthorized');
    const userId = customerId || req.user.id;
    try {
      const membership = await Membership.findById(membershipId);
      const customer = await User.findById(userId).populate('memberships');
      const transactions = await Transaction.find({
        customer,
        transactableType: 'Membership',
        transactable: membershipId,
        status: 'successful',
      })
        .populate('activeCycle')
        .sort({ paidAt: 'desc' });
      // verify that subscribed membership isn't expired
      // let transaction = transactions.find(x => {
      //   return x.activeCycle.endDate > new Date()
      // })
      if (!transactions || transactions.length == 0)
        return error(res, 400, 'No refundable transaction');
      if (!customer.bankAcount)
        return res, 400, 'Bank account required for succesful refund';

      const refund = await Transaction.create({
        type: 'refund',
        refund: transactions[0],
        reference: createReference('refund'),
        amount: transactions[0].amount,
        initiatedBy: req.user.id,
        // activeCycle: transactions[0].activeCycle,
        customer,
        bankAcount: customer.bankAcount,
        transactableType: 'Membership',
        transactable: membershipId,
        description: `Refund for ${membership.title} to ${customer.firstName} ${customer.lastName}`,
      });
      const paymentIntent = await StripeService.createPaymentIntent(
        refund,
        req.user
      );

      if (paymentIntent && paymentIntent.id) {
        refund.stripePaymentId = paymentIntent.id;
      }
      await refund.save();

      return success(res, 200, {
        message: 'Membership payment initiated successfully',
        clientSecret: paymentIntent.client_secret,
        transactionId: refund.id,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
