const { Recommendation, User } = require('../models');
const { error, success } = require('../middlewares/response');
const models = require('../models');

module.exports = {
  async reccomendFeature(req, res) {
    const { featureType, featureId, comment } = req.body;
    try {
      const user = await User.findById(req.user.id);
      const feature = await models[featureType].findById(featureId);
      if (!feature) return error(res, 400, 'Feature does not exist');
      const existingRec = await Recommendation.findOne({
        user,
        featureType,
        featureId,
      });
      if (existingRec)
        return error(res, 409, 'You already recommended this feature');

      await Recommendation.create({
        featureId,
        featureType,
        comment,
        user,
      });
      return success(res, 200, 'Recommendation successful');
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchRecommendations(req, res) {
    const { featureType, featureId } = req.query;
    try {
      const recommendations = await Recommendation.find({
        featureType,
        featureId,
      });
      return success(res, 200, { count: recommendations.length });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
