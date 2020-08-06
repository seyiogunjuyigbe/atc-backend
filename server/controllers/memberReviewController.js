const {
  MemberReview
} = require('../models/index');
const __Product = require('../models/product');
const __Activity = require('../models/activity');
const responses = require('../helper/responses');

const {
  check,
  validationResult
} = require('express-validator');

module.exports = {
  create: async (req, res) => {
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
      const product = await __Product.findOne({_id: req.body.productId});
      const activity = await __Activity.findOne({_id: req.body.activityId});
      if (!product) return res.status(404).send(responses.error(404, `Product not found`));
      if (!activity) return res.status(404).send(responses.error(404, `activity not found`));
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
              memberReview,
            ),
          );
      } else {
        return res
          .status(400)
          .send(responses.error(400, 'Unable to create review'));
      }

    } catch (error) {
      console.log(error)
      return res.status(500).send(responses.error(500, `Error creating a review ${error.message}`));
    }
  },
  viewMemberReview: async (req, res) => {
    try {
      const membership = await MemberReview.findById(req.params.memberReviewId);
      if (!membership) {
        return res
          .status(400)
          .send(responses.error(400, 'MemberReview not found'));
      } else {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              'Record was retrieved successfully',
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
  listMemberReview: (req, res) => {
    const offset = req.query.offset ? req.query.offset : 0;
    const limit = req.query.limit ? req.query.limit : 20;
    const orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    const order = req.query.order ? req.query.order : 'ASC';
    const ordering = [
      [orderBy, order]
    ];
    MemberReview
      .find({})
      .limit(Number(limit))
      .skip(Number(offset))
      // .sort({
      //   ordering
      // })
      .then(function (membership) {
        MemberReview.find({}).populate("activity").populate("product").populate("member").exec((err, memberReview) => {
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'Record was retrieved successfully',
                memberReview,
              ),
            );
        })

      });
  },
  updateMemberReview: async (req, res) => {
    try {
      const result = await MemberReview.findByIdAndpdate(req.params.memberReviewId, req.body);
      result.save()
      return res
        .status(200)
        .send(
          responses.success(200, 'MemberReview was updated successfully', result),
        );
    } catch (err) {
      return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
    }
  },
  deleteMemberReview: async (req, res) => {
    try {
      const membership = await MemberReview.findByIdAndDelete(req.params.memberReviewId);
      if (!membership)
        return res
          .status(400)
          .send(
            responses.error(400, 'Member Review not found'));

      else

        return res
          .status(200)
          .send(
            responses.success(200, 'Member Review was deleted successfully', membership)
          );

    } catch (err) {
      return  res
        .status(400)
        .send(
          responses.error(400, 'Member Review not found'));
    }
  }
};
