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
            dayNumber,
            title,
            description,
            bestVisitTime,
            bestVisitSeason,
            bestVisitWeather,
            calendarStatus,
            hasAccomodation,
            hasMeals,
            start,
            end,
            countries,
            adventureCategories,
            sightCategories,
            mainDestinationCity,
            mainDestinationCountry,
            route,
            stops
        } = req.body;
        let pictures = [],
            videos = [];
        if (dayNumber && isNaN(Number(dayNumber)) == true) return error(res, 400, 'Number required for number of days')
        if (sightCategories && Array.isArray(sightCategories) == false) return error(res, 400, 'Sight categories must be an array');
        if (adventureCategories && Array.isArray(adventureCategories) == false) return error(res, 400, 'Adventure categories must be an array')
        if (countries && Array.isArray(countries) == false) return error(res, 400, 'Countries must be an array')
        if (calendarStatus && calendarStatus.length > 0) {
            let wrongEntry = calendarStatus.find(entry => {
                return checkIfObj(entry) == false
            })
            if (wrongEntry) return error(res, 400, "Calendar status must be an array of objects")
        }
        if (stops && stops.length > 0) {
            let wrongEntry = stops.find(entry => {
                return checkIfObj(entry) == false
            })
            if (wrongEntry) return error(res, 400, "Route stops must be an array of objects")
        }
        if (req.files.length > 0) {
            req.files.forEach(file => {
                if (file.mimetype.indexOf('image') !== -1) pictures.push(file.path);
                if (file.mimetype.indexOf('video') !== -1) videos.push(file.path)

            })
        }
        try {
            let existingPack = await Activity.findOne({
                title,
                vendorId: req.user._id

            });
            if (existingPack) return error(res, 409, 'Duplicate name: Activity "' + title + '" already exists');
            else {
                let newActivity = await Activity.create({
                    vendorId: req.user.id,
                    dayNumber,
                    title,
                    description,
                    bestVisitTime,
                    bestVisitSeason,
                    bestVisitWeather,
                    calendarStatus,
                    hasAccomodation,
                    hasMeals,
                    start,
                    end,
                    countries,
                    adventureCategories,
                    sightCategories,
                    mainDestination: {
                        city: mainDestinationCity,
                        country: mainDestinationCountry
                    },
                    route,
                    stops,
                    pictures,
                    videos
                });
                if (newActivity) {
                    newActivity.save((err, activity) => {
                        if (err) return error(res, 400, err.message)
                        else {
                            return success(res, 200, {
                                message: 'Activity created successfully',
                                activity
                            })
                        }
                    })

                }
            }
        } catch (err) {
            return error(res, 500, err.message)
        }

    },
    async updateActivity(req, res) {
        const {
            dayNumber,
            title,
            description,
            bestVisitTime,
            bestVisitSeason,
            bestVisitWeather,
            calendarStatus,
            hasAccomodation,
            hasMeals,
            start,
            end,
            countries,
            adventureCategories,
            sightCategories,
            mainDestinationCity,
            mainDestinationCountry,
            stops,
            videos,
            route,
        } = req.body;
        try {
            let thisActivity = await Activity.findById(req.params.activityId);
            if (!thisActivity) return error(res, 404, 'Activity not found')
            else if (thisActivity.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            else {
                thisActivity.set({
                    dayNumber,
                    title,
                    description,
                    bestVisitTime,
                    bestVisitSeason,
                    bestVisitWeather,
                    calendarStatus,
                    hasAccomodation,
                    hasMeals,
                    start,
                    end,
                    countries,
                    adventureCategories,
                    sightCategories,
                    mainDestination: {
                        city: mainDestinationCity,
                        country: mainDestinationCountry
                    },
                    stops,
                    pictures,
                    videos,
                    route,
                });
                thisActivity.save((err, activity) => {
                    if (err) return error(res, 400, err.message)
                    else {
                        return success(res, 200, {
                            message: 'Activity updated successfully',
                            activity
                        })
                    }
                })
            }


        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllActivities(req, res) {
        try {
            let packages = await Activity.find({})
            if (!packages || packages.length == 0) return success(res, 200, 'No packages created yet');
            else return success(res, 200, packages)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchActivity(req, res) {
        try {
            let package = await Activity.findById(req.params.activityId)
            if (!package) return success(res, 204, 'Activity not found');
            else return success(res, 200, package)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deleteActivity(req, res) {
        try {
            let thisActivity = await Activity.findById(req.params.activityId);
            if (!thisActivity) return error(res, 404, 'Activity not found')
            else if (package.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            let package = await Activity.findByIdAndRemove(req.params.activityId)
            if (!package) return success(res, 204, 'Activity not found');
            else return success(res, 200, "Activity deleted")

        } catch (err) {
            return error(res, 500, err.message)
        }
    }

}

function checkIfObj(x) {
    return typeof (x) == 'object' && x !== null && Array.isArray(x) == false
}