const express = require("express");
const membershipCrl = require("../controllers/MembershipController");
const membershipRoute = express.Router();



membershipRoute.post("/member/create", membershipCrl.create);


membershipRoute.get("/member/list", membershipCrl.listMembership);
membershipRoute.put("/member/update/:id", membershipCrl.updateMembership);
membershipRoute.get("/member/one/:id", membershipCrl.viewMembership);




module.exports = membershipRoute;
