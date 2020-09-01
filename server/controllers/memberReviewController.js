const { check, validationResult } = require('express-validator');
const { MemberReview } = require('../models/index');
const __Product = require('../models/product');
const __Activity = require('../models/activity');
const responses = require('../helper/responses');
const Queryservice = require('../services/queryService');

module.exports = {
  create: async (req, res) => {
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
      const product = await __Product.findOne({ _id: req.body.productId });
      const activity = await __Activity.findOne({ _id: req.body.activityId });
      if (!product)
        return res.status(404).send(responses.error(404, `Product not found`));
      if (!activity)
        return res.status(404).send(responses.error(404, `activity not found`));
      const memberReview = await MemberReview.create({
        member: req.user._id,
        video: req.body.video,
        image: req.body.image,
        comment: req.body.comment,
        rating: req.body.rating,
        activity: activity._id,
        product: product._id,
      });
      if (memberReview) {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Your Member Review was successfully posted.',
              memberReview
            )
          );
      }
      return res
        .status(400)
        .send(responses.error(400, 'Unable to create review'));
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(responses.error(500, `Error creating a review ${error.message}`));
    }
  },
  viewMemberReview: async (req, res) => {
    try {
      const memberReview = await Queryservice.findOne(MemberReview, req, {
        _id: req.params.memberReviewId,
      });
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was retrieved successfully',
            memberReview
          )
        );
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error getting reviews ${error.message}`));
    }
  },
  getActivityReviewByProductId: async (req, res) => {
    // product:req.params.productId
    try {
      const memberReview = await Queryservice.find(MemberReview, req, {
        product: req.params.productId,
      });
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was retrieved successfully',
            memberReview
          )
        );
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error getting reviews ${error.message}`));
    }
  },
  listMemberReview: async (req, res) => {
    try {
      const memberReview = await Queryservice.find(MemberReview, req, {});
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Record was retrieved successfully',
            memberReview
          )
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error getting record ${err.message}`));
    }
  },
  updateMemberReview: async (req, res) => {
    try {
      const result = await MemberReview.findByIdAndpdate(
        req.params.memberReviewId,
        req.body
      );
      result.save();
      return res
        .status(200)
        .send(
          responses.success(
            200,
            'MemberReview was updated successfully',
            result
          )
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteMemberReview: async (req, res) => {
    try {
      const membership = await MemberReview.findByIdAndDelete(
        req.params.memberReviewId
      );
      if (!membership)
        return res
          .status(400)
          .send(responses.error(400, 'Member Review not found'));

      return res
        .status(200)
        .send(
          responses.success(
            200,
            'Member Review was deleted successfully',
            membership
          )
        );
    } catch (err) {
      return res
        .status(400)
        .send(responses.error(400, 'Member Review not found'));
    }
  },
};
