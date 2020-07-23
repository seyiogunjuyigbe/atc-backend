const express = require("express");
const membershipCrl = require("../controllers/MembershipController");
const membershipRoute = express.Router();



membershipRoute.post("/member/create", membershipCrl.create);



module.exports = membershipRoute;
