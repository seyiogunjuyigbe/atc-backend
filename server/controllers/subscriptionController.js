const { Subscription } = require('../models');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const { check, validationResult } = require('express-validator');

module.exports = {
  create: async (res, req) => {
    const result = validationResult(req);
    const hasErrors = !result.isEmpty();

    if (hasErrors) {
      return res
        .status(400)
        .send({ error: true, status_code: 400, message: result.array() });
    }

    try {
      const Subscription = await  Subscriptions.create(req.body);
      if (Subscription) {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Your Subscription was successfully created.',
              Subscription,
            ),
          );
      } else {
        return res
          .status(400)
          .send(responses.error(400, 'Unable to create Subscription'));
      }
    } catch (error) {
      return res
        .status(500)
        .send(
          responses.error(
            500,
            `Error creating a Subscription ${error.message}`,
          ),
        );
    }
  },
  viewSubscription: async (res, req) => {
    try {
      const subscription =  Subscription.findByPk(req.params.subId);
      if (!subscription) {
        return res
          .status(400)
          .send(responses.error(400, 'Subscription not found'));
      } else {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retreived successfully',
              subscription,
            ),
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send(
          responses.error(500, `Error viewing a subscription ${error.message}`),
        );
    }
  },
  listSubscription: (res, req) => {
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 20;
    var orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    var order = req.query.order ? req.query.order : 'ASC';
    var ordering = [[orderBy, order]];

     Subscription
      .findAndCountAll({
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: ordering,
      })
      .then(function (subscription) {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retreived successfully',
              subscription,
            ),
          );
      });
  },
  updateSubscription: async (res, req) => {
    try {
      const result = await  Subscription.update(req.body, {
        where: { id: req.params.subId },
      });

      return res
        .status(200)
        .send(
          responses.success(200, 'Subscription was updated successfully', result),
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteSubscription: async (res, req) => {
    try {
        const subscription = await  Subscription.destroy({
            where: {
                id: req.params.subId
            }
        });
        if (!subscription) 
        return res
        .status(400)
        .send(
          responses.error(400, 'subscription not found'));
        
        else 

      return res
      .status(200)
      .send(
        responses.success(200, 'Subscription was deleted successfully', subscription)
      );
        
    } catch (err) {
        return error(res, 500, err.message)
    }
}
};
