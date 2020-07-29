const {
  Membership
} = require('../models/index');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const {
  check,
  validationResult
} = require('express-validator');

module.exports = {
  create: async (res, req) => {
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
      if (membership) {
        const memberships = await Membership.create(req.body);
        if (memberhips) {
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
  viewMembership: async (res, req) => {
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
  listMembership: (res, req) => {
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
      .sort({
        ordering
      })
      .then(function (membership) {
        Membership.countDocuments().exec((err, memberships) => {
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
  updateMembership: async (res, req) => {
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
  deleteMembership: async (res, req) => {
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
  }
};