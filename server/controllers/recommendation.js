const { Recommendation, User, Transaction } = require("../models");
const { error, success } = require("../middlewares/response");
const models = require("../models");
const moment = require('moment')
module.exports = {
    async reccomendFeature(req, res) {
        const { featureType, featureId, comment } = req.body;
        try {
            let user = await User.findById(req.user.id)
            let feature = await models[featureType].findById(featureId);
            if (!feature) return error(res, 400, "Feature does not exist");
            let existingRec = await Recommendation.findOne({ user, featureType, featureId });
            if (existingRec) return error(res, 409, 'You already recommended this feature');
            else {
                let recommendation = await Recommendation.create({ featureId, featureType, comment, user });
                return success(res, 200, "Recommendation successful")
            }
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchRecommendations(req, res) {
        let { featureType, featureId } = req.query;
        try {
            let recommendations = await Recommendation.find({ featureType, featureId });
            return success(res, 200, { count: recommendations.length })
        } catch (err) {
            return error(res, 500, err.message)
        }
    },


}