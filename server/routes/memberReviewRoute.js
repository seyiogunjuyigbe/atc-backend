const express = require("express");
const memberReviewCrl = require("../controllers/memberReviewController");
const memberReviewRoute = express.Router();
const authenticate = require('../middlewares/authentication')


memberReviewRoute.post("/",authenticate, memberReviewCrl.create);


memberReviewRoute.get("/",authenticate, memberReviewCrl.listMemberReview);
memberReviewRoute.put("/:memberReviewId",authenticate, memberReviewCrl.updateMemberReview);
memberReviewRoute.get("/:memberReviewId",authenticate, memberReviewCrl.viewMemberReview);
memberReviewRoute.delete("/:memberReviewId",authenticate, memberReviewCrl.deleteMemberReview);




module.exports = memberReviewRoute;
