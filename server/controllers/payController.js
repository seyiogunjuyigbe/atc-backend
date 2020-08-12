const { success, error } = require('../middlewares/response');
const { User } = require('../models');
const { STATE } = require('../config/config');
const { addVendorAccount } = require('../services/stripeService')
module.exports = {
    async addVendorAccount(req, res) {
        const { } = req.query;
        try {
            if (state !== STATE) {
                return error(res, 403, { error: 'Incorrect state parameter: ' + state });
            }
            else {
                await addVendorAccount(req.user, code)
            }

        } catch (err) {

        }
    }
}