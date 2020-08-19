const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const walletSchema = new Schema({
    balance: Number,
    previousBalance: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Wallet", walletSchema)