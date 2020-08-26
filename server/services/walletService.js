const { Wallet, WalletHistory, Transaction } = require("../models");
const { createReference } = require("./paymentService");

module.exports = {
    async createUserWallet(user) {
        try {
            const userWallet = await Wallet.create({
                balance: 0,
                previousBalance: 0,
                loyaltyPoints: 0,
                user
            })
            return userWallet;
        } catch (err) {
            console.log(err)
            return err.message
        }
    },
    async fetchWallet(user) {
        try {
            let userWallet = await Wallet.findOne({ user });
            // if user wallet does not exist, create a new one
            if (!userWallet) {
                userWallet = await Wallet.create({
                    balance: 0,
                    previousBalance: 0,
                    loyaltyPoints: 0,
                    user
                })
            }
            return userWallet;
        } catch (err) {
            return err.message
        }
    },
    async creditWallet(user, amount) {
        try {
            let userWallet = await Wallet.findOne({ user });
            // create transaction
            userWallet.previousBalance = userWallet.balance
            userWallet.balance += Number(amount);

            await userWallet.save();
            let transaction = await Transaction.create({
                amount,
                type: "payout",
                description: "Payout to wallet",
                paymentType: "Wallet",
                initiatedBy: user,
                reference: createReference('payout'),
                provider: "system",
                status: "successful",
                wallet: userWallet
            })
            // create wallet history
            let walletHistory = await WalletHistory.create({
                balance: userWallet.balance,
                previousBalance: userWallet.previousBalance,
                amount,
                type: "credit",
                transaction,
                description: transaction.description,
                user,
                wallet: userWallet
            })

            return userWallet;
        } catch (err) {
            return err.message
        }
    },
    async debitWallet(user, amount) {
        try {
            let userWallet = await Wallet.findOne({ user });
            userWallet.previousBalance = userWallet.balance
            userWallet.balance -= Number(amount);
            await userWallet.save();
            let transaction = await Transaction.create({
                type: 'withdrawal',
                reference: createReference('withdrawal'),
                provider: 'transferwise',
                paymentType: "BankAccount",
                amount,
                initiatedBy: user.id,
                vendor: user,
                wallet: userWallet,
                bankAccount: user.bankAccount,
                description: "Withdrawal from wallet to bank account",
            })
            // create wallet history
            let walletHistory = await WalletHistory.create({
                balance: userWallet.balance,
                previousBalance: userWallet.previousBalance,
                amount: transaction.amount,
                type: "debit",
                transaction,
                description: transaction.description,
                user
            })
            return transaction;
        } catch (err) {
            return err.message
        }
    },
    async awardLoyaltyPoints(user, points) {
        try {
            let userWallet = await Wallet.findOne({ user });
            userWallet.loyaltyPoints += Number(points);
            await userWallet.save();
            return userWallet;
        } catch (err) {
            return err.message
        }
    },
    async refundPaymentToWallet(user, transaction) {
        try {
            let refund = await Transaction.create({
                type: "refund",
                refund: transaction,
                paymentType: "wallet",
                reference: createReference('refund'),
                amount: transaction.amount,
                initiatedBy: user.id,
                customer: user,
                bankAcount: user.bankAcount,
                transactableType: 'Product',
                transactable: transaction.transactableType,
                description: `Refund for ${transaction.transactableType.title} to ${user.firstName} ${user.lastName}`,
            });
            return (await this.creditWallet(user, refund.amount))
        } catch (err) {
            return err.message
        }
    },
    async refundPaymentToPoints(user, transaction) {
        try {
            let refund = await Transaction.create({
                type: "refund",
                refund: transaction,
                paymentType: "wallet",
                reference: createReference('refund'),
                amount: transaction.amount,
                initiatedBy: user.id,
                customer: user,
                bankAcount: user.bankAcount,
                transactableType: 'Product',
                transactable: transaction.transactableType,
                description: `Refund for ${transaction.transactableType.title} to ${user.firstName} ${user.lastName}`,
            });
            return (await this.awardLoyaltyPoints(user, refund.amount))
        } catch (err) {
            return err.message
        }
    }
}
