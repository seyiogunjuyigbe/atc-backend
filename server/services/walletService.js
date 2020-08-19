const { Wallet, WalletHistory, Transaction } = require("../models")
module.exports = {
    async createUserWallet(user) {
        try {
            const userWallet = await Wallet.create({
                balance: 0,
                previousBalance: 0,
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
                description: "Payout to wallet",
                paymentType: "wallet",
                provider: "system",
                status: "successful",
                wallet: userWallet
            })
            // create wallet history
            let walletHistory = WalletHistory.create({
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
            // create transaction
            let transaction = await Transaction.create({
                amount,
                description: "Payout to wallet",
                paymentType: "wallet",
                provider: "system",
                status: "successful",
                wallet: userWallet
            })
            // create wallet history
            let walletHistory = WalletHistory.create({
                balance: userWallet.balance,
                previousBalance: userWallet.previousBalance,
                amount,
                type: "debit",
                transaction,
                description: transaction.description,
                user
            })

            return userWallet;
        } catch (err) {
            return err.message
        }
    },
}