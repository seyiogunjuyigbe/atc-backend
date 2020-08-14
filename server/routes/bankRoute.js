const router = require("express").Router();
const bankCtrl = require("../controllers/bankController");
const authenticate = require('../middlewares/authentication')
const { check } = require('express-validator');
const validate = require('../middlewares/validate');
const { checkIfAdmin } = require("../middlewares/access")
router.post("/bank-accounts", authenticate, bankCtrl.addBankAccount)
router.get("/bank-accounts/:bankAccountId", authenticate, bankCtrl.fetchAccount)
router.put("/bank-accounts/:bankAccountId", authenticate, bankCtrl.updateRecipient)
router.delete("/bank-accounts/:bankAccountId", authenticate, bankCtrl.deleteRecipient)
router.get("/bank-accounts", authenticate, checkIfAdmin, bankCtrl.listAccounts)
router.post("/payout", authenticate, checkIfAdmin,
    [
        check('userId').not().isEmpty().withMessage("Required field"),
        check('amount').not().isEmpty().withMessage("Required field"),
    ],
    validate, bankCtrl.payRecipient);
module.exports = router;