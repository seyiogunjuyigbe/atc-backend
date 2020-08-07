const { Membership, User, Transaction } = require('../models/index');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const { success, error } = require('../middlewares/response')
const {
  check,
  validationResult
} = require('express-validator');
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
      //check if it exist
      const membership = await Membership.findOne({
        name: req.body.name
      });
      if (!membership) {
        const memberships = await Membership.create({ ...req.body, createdBy: req.user.id });
        if (memberships) {
          memberships.save()
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'Your Membership was successfully created.',
                memberships,
              ),
            );
        } else {
          return res
            .status(400)
            .send(responses.error(400, 'Unable to create Membership'));
        }
      } else {
        return res
          .status(201)
          .send(
            responses.error(
              201,
              'membership with similar credentials already exists',
            ),
          );

      }

    } catch (error) {
      return res.status(500).send(responses.error(500, `Error creating a user ${error.message}`));
    }
  },
  viewMembership: async (req, res) => {
    try {
      const membership = await Membership.findById(req.params.membershipId);
      if (!membership) {
        return res
          .status(400)
          .send(responses.error(400, 'Membership not found'));
      } else {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retreived successfully',
              membership,
            ),
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a user ${error.message}`));
    }
  },
  listMembership: (req, res) => {
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 20;
    var orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    var order = req.query.order ? req.query.order : 'ASC';
    var ordering = [
      [orderBy, order]
    ];

    Membership
      .find({})
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
                memberships,
              ),
            );
        })

      });
  },
  updateMembership: async (req, res) => {
    try {
      const result = await Membership.findByIdAndpdate(req.params.membershipId, req.body);
      result.save()
      return res
        .status(200)
        .send(
          responses.success(200, 'Membership was updated successfully', result),
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteMembership: async (req, res) => {
    try {
      const membership = await Membership.findByIdAndDelete(req.params.membershipId);
      if (!membership)
        return res
          .status(400)
          .send(
            responses.error(400, 'Membership not found'));

      else

        return res
          .status(200)
          .send(
            responses.success(200, 'Membership was deleted successfully', membership)
          );

    } catch (err) {
      return error(res, 500, err.message)
    }
  },
  async purchaseMembership(req, res) {
    try {
      const membership = await Membership.findById(req.params.membershipId);
      if (!membership) {
        return error(res, 404, 'Membership not found');
      }

      const newTransaction = await Transaction.create({
        reference: createReference('payment'),
        amount: membership.cost,
        currency: req.body.currency || 'usd',
        initiatedBy: req.user.id,
        customer: req.body.customer || req.user.id,
        transactableType: 'Membership',
        transactable: membership.id,
        description: `Payment for ${membership.name}`,
      });

      const paymentIntent = await StripeService.createPaymentIntent(
        newTransaction, req.user
      );

      if (paymentIntent && paymentIntent.id) {
        newTransaction.stripePaymentId = paymentIntent.id;

        await newTransaction.save()
      }
      return success(res, 200,
        {
          message: 'Membership payment initiated successfully',
          clientSecret: paymentIntent.client_secret,
          transactionId: newTransaction.id,
        })
    } catch (err) {
      return error(res, 500, err.message)
    }
  },
  async subscribeToMembership(req, res) {
    const { membershipId } = req.params;
    try {
      let membership = await Membership.findById(membershipId);
      let user = await User.findById(req.user.id).populate('memberships');
      let { memberships } = user;
      let checkIfFree = memberships.find(x => {
        return x.type == "default"
      });
      let checkIfOneOff = memberships.filter(x => {
        return x.type == "one-off"
      })
      let checkIfAnnual = memberships.find(x => {
        return x.type == "annual"
      })
      if (checkIfFree) {
        // if current plan is free, remove free from array and overrride with plan
        if (membership.type == "default") {
          return error(res, 409, 'User already subscribed to free membership')
        } else {
          memberships.splice(memberships.indexOf(checkIfFree), 1);
          memberships.push(membership)
        }
      }
      if (checkIfOneOff) {
        // if  plan is a one-off membrship and current plans are one-off membeships, add membership to array;
        if (membership.type == "one-off") memberships.push(membership)
        // if plan is an annual plan, and current plan is/are one-offs, override with  annual,
        else if (membership.type == "annual") {
          memberships.length = 0;
          memberships.push(membership)
        }
        else {
          return error(res, 409, 'User already subscribed to one-off membership')
        }
      }
      if (checkIfAnnual) {
        // if plan is one-off and current plan is annual, retain annual
        if (membership.type == "one-off") {
          return error(res, 409, 'User already subscribed to annual membership')
        } else if (membership.type == "annual") {
          // if plan is annual and current plan is annial. override with recent
          memberships.splice(memberships.indexOf(checkIfAnnual), 1);
          memberships.push(membership)
        }
        else {
          return error(res, 409, 'User already subscribed to annual membership')
        }
      }
      await user.save();
      return success(res, 200, { message: "Subscription successful", user })
    } catch (err) {
      return error(res, 500, err.message)
    }
  }
};
