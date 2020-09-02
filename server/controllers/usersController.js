const { validationResult } = require('express-validator');
const { Membership, User } = require('../models');
const responses = require('../helper/responses');
const Queryservice = require('../services/queryService');

module.exports = {
  create: (res, req) => {
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
      Membership.findOne({
        name: req.body.name,
      }).then(async foundMembership => {
        if (foundMembership !== null) {
          return res
            .status(201)
            .send(
              responses.error(
                201,
                'membership with similar credentials already exists'
              )
            );
        }

        const membership = await Membership.create(req.body);
        if (membership) {
          membership.save();
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'Your membership was successfully created.',
                membership
              )
            );
        }
        return res
          .status(400)
          .send(responses.error(400, 'Unable to create User'));
      });
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a user ${error.message}`));
    }
  },
  list: async (res, req) => {
    const users = await Queryservice.find(User, req);
    return responses.success(res, 200, users);
  },
};
