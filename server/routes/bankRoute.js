const router = require("express").Router();
const bankCtrl = require("../controllers/bankController");
const walletCtrl = require("../controllers/walletController")
const authenticate = require('../middlewares/authentication')
const { check } = require('express-validator');
const validate = require('../middlewares/validate');
const { checkIfAdmin } = require("../middlewares/access")
router.post("/bank-accounts", authenticate, bankCtrl.addBankAccount)
router.get("/bank-accounts/:bankAccountId", authenticate, bankCtrl.fetchAccount)
router.put("/bank-accounts/:bankAccountId", authenticate, bankCtrl.updateRecipient)
router.delete("/bank-accounts/:bankAccountId", authenticate, bankCtrl.deleteRecipient)
router.get("/bank-accounts", authenticate, checkIfAdmin, bankCtrl.listAccounts)
router.post("/payments/withdraw", authenticate,
    check('amount').not().isEmpty().withMessage("Required field"),
    validate, bankCtrl.withdrawFromWallet);
router.get("/wallet", authenticate, checkIfAdmin, walletCtrl.fetchUserWallet);
router.get("/wallet-history", authenticate, checkIfAdmin, walletCtrl.fetchAllWalletHistories)
router.get("/wallet-history/:userId", authenticate, checkIfAdmin, walletCtrl.fetchUserWalletHistory)

module.exports = router;