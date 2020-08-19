const { success, error } = require('../middlewares/response');
const { User, BankAccount, Transaction } = require('../models');
const twService = require("../services/twservice");
const { createReference } = require("../services/paymentService");
const { debitWallet, fetchWallet } = require('../services/walletService');
module.exports = {
    async addBankAccount(req, res) {
        try {
            let existingAcct = await BankAccount.findOne({ owner: req.user.id });
            if (existingAcct) return error(res, 409, 'Bank account already exists for this user');
            let user = await User.findById(req.user.id)
            let bankAccount = await new BankAccount({ ...req.body, owner: req.user.id });
            let resp = await twService.createRecipient(bankAccount);
            if (resp.error) return error(res, 400, resp.error)
            else {
                bankAccount.transferWiseId = resp.id
                await bankAccount.save();
                user.bankAccount = bankAccount;
                await user.save()
            }
            return success(res, 200, { bankAccount })
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAccount(req, res) {
        try {
            let account = await BankAccount.findById(req.params.bankAccountId).populate("owner");
            return success(res, 200, account)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async listAccounts(req, res) {
        try {
            let accounts = await BankAccount.find({}).populate("owner");
            return success(res, 200, accounts)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deleteRecipient(req, res) {
        try {
            let thisBank = BankAccount.findById(req.params.bankAccountId)
            if (String(thisBank.owner) !== String(req.user.id)) return error(res, 401, 'Unauthorized access')
            else {
                await twService.deleteRecipientAccount(user.bankAccount.transferWiseId);
                await thisBank.remove()
                return success(res, 200, { success: true, message: "Account deleted" })
            }


        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async updateRecipient(req, res) {
        try {
            let user = await User.findById(req.user.id).populate('bankAccount')
            let newBankAccount = await BankAccount.findByIdAndUpdate(req.params.bankAccountId, { ...req.body });
            if (String(newBankAccount.owner) !== String(req.user.id)) return error(res, 401, 'Unauthorized access')
            let resp = await twService.createRecipient(bankAccount);
            if (resp.error) return error(res, 400, resp.error)
            else {
                newBankAccount.transferWiseId = resp.id
                await newBankAccount.save();
                await user.save()
                return success(res, 200, { success: true, newBankAccount })

            }
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async payoutFromWallet(req, res) {
        let { amount } = req.body
        try {
            let user = await User.findById(req.user.id).populate('bankAccount');
            if (!user) return error(res, 404, "Payee account not found");
            let userWallet = await fetchWallet(user);
            if (userWallet.balance < amount) return error(res, 400, 'Insuffcient wallet balance')
            else if (!user.bankAccount) return error(res, 400, "Bank acount required for payout")
            else if (isNaN(amount)) return error(res, 400, "Valid amount required for payout");
            else {
                let quote = await twService.createQuote(user.bankAccount, amount);
                if (quote.error || typeof (quote) == "string") return error(res, 400, quote.error || quote)
                else {
                    let transaction = await Transaction.create({
                        type: 'payout',
                        reference: createReference('payout'),
                        provider: 'transferwise',
                        paymentType: "withdrawal",
                        amount,
                        initiatedBy: req.user.id,
                        vendor: user,
                        wallet: userWallet,
                        bankAccount: user.bankAccount,
                        description: "Payout from ATC",
                    })
                    let transfer = await twService.initateTransfer(user.bankAccount.transferWiseId, quote.id, transaction.reference);
                    if (transfer.error && typeof (transfer) == "string") {
                        return error(res, 400, transfer.error || transfer)
                    }
                    else {
                        transaction.transferwiseId = transfer.id;
                        let payout = await twService.completeTransfer(transfer.id);
                        if (payout.status !== "COMPLETED") transaction.status = "failed";
                        else transaction.status = "successful";
                        await transaction.save();
                        let debit = await debitWallet(user, transaction.amount);
                        console.log({ debit })
                        return success(res, 200, payout)
                    }
                }
            }
        } catch (err) {
            return error(res, 500, err.message)
        }

    }
}

