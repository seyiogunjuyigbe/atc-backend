const express = require('express');
const membershipCrl = require('../controllers/membershipController');

const membershipRoute = express.Router();
const authenticate = require('../middlewares/authentication');
const { checkIfAdmin } = require('../middlewares/access');

membershipRoute.post('/', authenticate, membershipCrl.create);
membershipRoute.get('/', membershipCrl.listMembership);
membershipRoute.put(
  '/:membershipId',
  authenticate,
  membershipCrl.updateMembership
);
membershipRoute.get('/:membershipId', membershipCrl.viewMembership);
membershipRoute.delete(
  '/:membershipId',
  authenticate,
  membershipCrl.deleteMembership
);
membershipRoute.post(
  '/:membershipId/purchase',
  authenticate,
  membershipCrl.purchaseMembership
);
membershipRoute.post(
  '/:membershipId/refund',
  authenticate,
  membershipCrl.refundMembership
);

module.exports = membershipRoute;
