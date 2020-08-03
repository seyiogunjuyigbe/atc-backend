const router = require("express").Router();
const { fetchCountry, fetchState, fetchAllCountries } = require('../controllers/stateController')

router.get('/states', fetchState);
router.get('/country', fetchCountry)
router.get('/all-countries', fetchAllCountries)
module.exports = router;