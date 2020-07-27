const {
    Activity,
} = require('../models');
const {
    success,
    error
} = require("../middlewares/response");

module.exports = {
    async createActivity(req, res) {
        const {
            name,
            description,
            features,
            price
        } = req.body;
        try {
            let existingPack = await Activity.findOne({
                where: {
                    name
                }
            });
            if (existingPack) return error(res, 409, 'Duplicate name: Activity "' + name + '" already exists');
            else {
                let newActivity = await Activity.create({
                    name,
                    description,
                    createdBy: req.user.id,
                    features,
                    price
                });
                if (newActivity) return success(res, 200, {
                    message: 'Activity created successfully',
                    package: newActivity
                })
            }
        } catch (err) {
            return error(res, 500, err.message)
        }

    },
    async updateActivity(req, res) {
        const {
            name,
            description,
            features,
            price
        } = req.body;
        try {
            let thisActivity = await Activity.findByPk(req.params.activityId);
            if (!thisActivity) return error(res, 404, 'Activity not found')
            else if (package.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            else {
                let updatedActivity = await Activity.update({
                    name,
                    description,
                    features,
                    price
                }, {
                    where: {
                        id: req.params.activityId
                    }
                });
                if (!updatedActivity) return error(res, 404, 'Activity not found')
                if (updatedActivity) return success(res, 200, {
                    message: 'Activity updated successfully',
                })
            }


        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllActivities(req, res) {
        try {
            let packages = await Activity.findAll()
            if (!packages || packages.length == 0) return success(res, 204, 'No packages created yet');
            else return success(res, 200, packages)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchActivity(req, res) {
        try {
            let package = await Activity.findByPk(req.params.activityId)
            if (!package) return success(res, 204, 'Activity not found');
            else if (package.createdBy !== userId) return error(res, 401, 'You are not authorized to do this')
            else return success(res, 200, package)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deleteActivity(req, res) {
        try {
            let thisActivity = await Activity.findByPk(req.params.activityId);
            if (!thisActivity) return error(res, 404, 'Activity not found')
            else if (package.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            let package = await Activity.destroy({
                where: {
                    id: req.params.activityId
                }
            })
            if (!package) return success(res, 204, 'Activity not found');
            else return success(res, 200, "Activity deleted")

        } catch (err) {
            return error(res, 500, err.message)
        }
    }

}