const express = require("express");
const memberReviewCrl = require("../controllers/memberReviewController");
const memberReviewRoute = express.Router();
const authenticate = require('../middlewares/authentication')


memberReviewRoute.post("/",authenticate, memberReviewCrl.create);


memberReviewRoute.get("/", memberReviewCrl.listMemberReview);
memberReviewRoute.put("/:memberReviewId",authenticate, memberReviewCrl.updateMemberReview);
memberReviewRoute.get("/:memberReviewId",memberReviewCrl.viewMemberReview);
memberReviewRoute.get("/getActivityReviewByProductId/:productId",memberReviewCrl.getActivityReviewByProductId);
memberReviewRoute.delete("/:memberReviewId",authenticate, memberReviewCrl.deleteMemberReview);




module.exports = memberReviewRoute;
