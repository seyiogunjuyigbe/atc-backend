'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const installmentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    recurringAmount: Number,
    recurrentCount: Number,
    maxNoOfInstallments: Number,
    isCompleted: Boolean,
    lastChargeDate: Date,
    nextChargeDate: Date,
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    }],
    paymentIntent: Object,
    amountCapturable: Number
})

module.exports = mongoose.model("Installment", installmentSchema)