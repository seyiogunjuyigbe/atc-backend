
const { Membership } = require('../models');
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
      //check if it exist
     const membership =  Membership.findOne({ where: { name: req.body.name } });
          if (membership) {
            const Memberships = await Membership.create(req.body);
            if (Memberships) {
              return res
                .status(200)
                .send(
                  responses.success(
                    200,
                    'Your Membership was successfully created.',
                    Memberships,
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
      const membership = Membership.findByPk(req.params.membershipId);
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
    var ordering = [[orderBy, order]];

    Membership
      .findAndCountAll({
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: ordering,
      })
      .then(function (membership) {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retreived successfully',
              membership,
            ),
          );
      });
  },
  updateMembership: async (res, req) => {
    try {
      const result = await Membership.update(req.body, {
        where: { id: req.params.membershipId },
      });

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
      const membership = await Membership.destroy({
            where: {
                id: req.params.membershipId
            }
        });
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
