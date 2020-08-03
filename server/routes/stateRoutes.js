const router = require("express").Router();
const { fetchCountry, fetchState, fetchAllCountries } = require('../controllers/stateController')

router.get('/states', fetchState);
router.get('/countries', fetchAllCountries)
router.get('/country', fetchCountry)
module.exports = router;