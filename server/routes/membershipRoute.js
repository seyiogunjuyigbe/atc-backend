const express = require("express");
const membershipCrl = require("../controllers/membershipController");
const membershipRoute = express.Router();
const authenticate = require('../middlewares/authentication')

membershipRoute.post("/", membershipCrl.create);


membershipRoute.get("/", membershipCrl.listMembership);
membershipRoute.put("/:membershipId", membershipCrl.updateMembership);
membershipRoute.get("/:membershipId", membershipCrl.viewMembership);
membershipRoute.delete("/:membershipId", membershipCrl.deleteMembership);
membershipRoute.put("/:membershipId/subscribe", authenticate, membershipCrl.subscribeToMembership)



module.exports = membershipRoute;
