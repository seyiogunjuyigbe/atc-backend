const { State, Country } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async fetchState(req, res) {
    const { stateId, countryId } = req.query;
    try {
      const states = await State.find({
        $or: [{ _id: stateId }, { country: countryId }],
      });
      return success(res, 200, states);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchCountry(req, res) {
    const { countryId, name } = req.query;
    const searchName = name || '';

    try {
      const country = await Country.findOne({
        $or: [{ _id: countryId }, { name: searchName.toUpperCase() }],
      }).populate('states');
      return success(res, 200, country);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchAllCountries(req, res) {
    try {
      const countries = await Country.find({}).populate('states');
      return success(res, 200, countries);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
