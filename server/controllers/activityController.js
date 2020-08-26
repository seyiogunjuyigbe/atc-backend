const { Activity, Country, Transaction, Recommendation, State, Product } = require('../models');
const { success, error } = require("../middlewares/response");
const Queryservice = require("../services/queryService")
module.exports = {
    async createActivity(req, res) {
        const {
            dayNumber,
            title,
            calendarStatus,
            start,
            end,
            product,
            countries,
            adventureCategories,
            sightCategories,
            marketingExpiryDate,
            cityId,
            countryId
        } = req.body;
        if (new Date(start) > new Date(end)) return error(res, 400, 'Wrong start and enddate selection')
        if (dayNumber && isNaN(Number(dayNumber)) == true) return error(res, 400, 'Number required for number of days')
        if (sightCategories && Array.isArray(sightCategories) == false) return error(res, 400, 'Sight categories must be an array');
        if (adventureCategories && Array.isArray(adventureCategories) == false) return error(res, 400, 'Adventure categories must be an array')
        if (countries && Array.isArray(countries) == false) return error(res, 400, 'Countries must be an array')
        // if (calendarStatus && calendarStatus.length > 0) {
        //     let wrongEntry = calendarStatus.find(entry => {
        //         return checkIfObj(entry) == false
        //     })
        //     if (wrongEntry) return error(res, 400, "Calendar status must be an array of objects")
        // }
        try {
            let country = await Country.findById(countryId);
            let city = await State.findById(cityId)
            let existingPack = await Activity.findOne({
                title,
                vendor: req.user._id

            });
            if (existingPack) return error(res, 409, 'Duplicate name: Activity "' + title + '" already exists');
            else {
                let newActivity = await Activity.create({
                    ...req.body,
                    vendor: req.user.id,
                    mainDestination: {
                        city,
                        country
                    },

                });
                let thisproduct = await Product.findById(product)
                thisproduct.activities.push(newActivity);
                await thisproduct.save()
                return success(res, 200, {
                    message: 'Activity created successfully',
                    activity: newActivity
                })
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
            product,
            countries,
            adventureCategories,
            sightCategories,
            cityId,
            countryId,
            stops,
            contents,
            route,
            marketingExpiryDate
        } = req.body;
        try {
            let country = await Country.findById(countryId);
            let city = await State.findById(cityId)
            let thisActivity = await Activity.findById(req.params.activityId);
            if (!thisActivity) return error(res, 404, 'Activity not found')
            else if (String(thisActivity.vendor) !== req.user.id) return error(res, 401, 'You are not authorized to do this')
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
                    product,
                    countries,
                    adventureCategories,
                    sightCategories,
                    mainDestination: {
                        city,
                        country
                    },
                    stops,
                    contents,
                    route,
                    marketingExpiryDate
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
            let activities = await Queryservice.find(Activity, req)
            return success(res, 200, activities)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchActivity(req, res) {
        let { hours } = req.query
        try {
            let activity = await Queryservice.findOne(Activity, req);
            activity.stats.views += 1;
            await activity.save();
            let result = await fetchWithStats(model = "Activity", activity, hours)
            return success(res, 200, result)
            // return success(res, 200, activity)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deleteActivity(req, res) {
        try {
            let thisActivity = await Activity.findById(req.params.activityId);
            if (!thisActivity) return error(res, 404, 'Activity not found')
            else if (String(thisActivity.vendor) !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            await Activity.findByIdAndRemove(req.params.activityId)
            return success(res, 200, "Activity deleted")
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async upadteActivityPriority(req, res) {
        const { activityId } = req.params;
        const { priority } = req.body;
        if (isNaN(Number(priority)) == true) return error(res, 400, 'Priority must be a valid number')
        try {
            let activity = await Activity.findById(activityId);
            activity.set({ marketingPriority: priority });
            await activity.save();
            return success(res, 200, activity)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchHomePageActivities(req, res) {
        let today = new Date();
        try {
            let activities = await Queryservice.find(Activity, req, { marketingExpiryDate: { $gte: today } });
            return success(res, 200, activities)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }

}

function checkIfObj(x) {
    return typeof (x) == 'object' && x !== null && Array.isArray(x) == false
}
async function fetchWithStats(model, doc, hours) {
    let purchases;
    try {
        let recommendations = await Recommendation.find({ featureType: model, featureId: doc.id });
        let sales = await Transaction.find({
            type: "payment", transactableType: model, transactable: doc.id, $or: [{ status: "successful" }, { status: "settled" }]
        })
        if (hours) {
            purchases = sales.filter(purchase => {
                return Math.round(moment.duration(moment().diff(moment(purchase.paidAt))).asHours()) <= Number(hours)
            });
            recommendations = recommendations.filter(recommendation => {
                return Math.round(moment.duration(moment().diff(moment(recommendation.date))).asHours()) <= Number(hours)
            });
        } else {
            purchases = sales
        }
        return {
            doc,
            recommendations: recommendations.length,
            purchases: purchases.length,
            sales: sales.length
        }
    } catch (err) {
        return err
    }

}