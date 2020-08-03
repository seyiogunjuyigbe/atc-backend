const { State, Country } = require('../models');
const { success, error } = require('../middlewares/response');
module.exports = {
    async fetchState(req, res) {
        let { stateId, countryId } = req.query;
        try {
            let states = await State.find({ $or: [{ _id: stateId }, { countryId }] });
            return success(res, 200, states)
        } catch (err) {
            return error(res, 500, err.message)
        }

    },
    async fetchCountry(req, res) {
        let { countryId, name } = req.query;
        let searchName = name || ""

        try {
            let country = await Country.findOne({ $or: [{ _id: countryId }, { name: searchName.toUpperCase() }] }).populate('states')
            return success(res, 200, country)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllCountries(req, res) {
        try {
            let countries = await Country.find({}).populate('states')
            return success(res, 200, countries)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }
}