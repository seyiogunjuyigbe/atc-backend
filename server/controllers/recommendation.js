const { Recommendation, User, Transaction } = require("../models");
const { error, success } = require("../middlewares/response");
const models = require("../models");
const Queryservice = require("../services/queryService")

module.exports = {
    async reccomendFeature(req, res) {
        const { featureType, featureId, comment } = req.body;
        try {
            let user = await User.findById(req.user.id)
            let feature = await models[featureType].findById(featureId);
            if (!feature) return error(res, 400, "Feature does not exist");
            let existingRec = await Recommendation.findOne({ user, comment, featureType, featureId });
            if (existingRec) return error(res, 409, 'You alreasy recommended this feature');
            else {
                let recommendation = await Recommendation.create({ featureId, featureType, user });
                return success(res, 200, "Recommendation successful")
            }
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchRecommendations(req, res) {
        try {
            let recommendations = await Queryservice.find(req);
            return success(res, 200, recommendations.length)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }
}