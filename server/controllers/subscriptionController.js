const { validationResult } = require('express-validator');
const { Subscription } = require('../models');
const responses = require('../helper/responses');
const Queryservice = require('../services/queryService');

module.exports = {
  create: async (res, req) => {
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
      const subscription = await Subscription.create(req.body);
      if (subscription) {
        subscription.save();
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Your Subscription was successfully created.',
              subscription
            )
          );
      }
      return res
        .status(400)
        .send(responses.error(400, 'Unable to create Subscription'));
    } catch (error) {
      return res
        .status(500)
        .send(
          responses.error(500, `Error creating a Subscription ${error.message}`)
        );
    }
  },
  viewSubscription: async (res, req) => {
    try {
      const subscription = await Subscription.findById(req.params.subId);
      if (!subscription) {
        return res
          .status(400)
          .send(responses.error(400, 'Subscription not found'));
      }
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was retreived successfully',
            subscription
          )
        );
    } catch (error) {
      return res
        .status(500)
        .send(
          responses.error(500, `Error viewing a subscription ${error.message}`)
        );
    }
  },
  listSubscription: async (res, req) => {
    const subscriptions = await Queryservice.find(Subscription, req);
    return responses.success(res, 200, subscriptions);
  },
  updateSubscription: async (res, req) => {
    try {
      const result = await Subscription.findByIdAndUpdate(
        req.params.subId,
        req.body
      );
      result.save();
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Subscription was updated successfully',
            result
          )
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteSubscription: async (res, req) => {
    try {
      const subscription = await Subscription.findByIdAndDelete(
        req.params.subId
      );
      if (!subscription)
        return res
          .status(400)
          .send(responses.error(400, 'subscription not found'));

      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Subscription was deleted successfully',
            subscription
          )
        );
    } catch (err) {
      return responses.error(res, 500, err.message);
    }
  },
};
