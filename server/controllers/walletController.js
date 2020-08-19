const walletService = require("../services/walletService");
const { success, error } = require("../middlewares/response");
const { WalletHistory } = require("../models")
module.exports = {
    async fetchUserWallet(req, res) {
        try {
            let userWallet = await walletService.fetchWallet(req.user.id);
            if (typeOf(userWallet) !== "string") return success(res, 200, userWallet)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchUserWalletHistory(req, res) {
        try {
            let walletHistory = await WalletHistory.find({ user: req.params.userId });
            return success(res, 200, walletHistory)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllWalletHistories(req, res) {
        try {
            let walletHistory = await WalletHistory.find({});
            return success(res, 200, walletHistory)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }
}