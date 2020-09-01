'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentScheduleSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    activeCycle: {
        type: Schema.Types.ObjectId,
        ref: "ActiveCycle"
    },
    amount: Number,
    chargeDate: Date,
    amountCapturable: Number,
    failedAttempts: {
        type: Number,
        default: 0
    },
    isPaid: { type: Boolean, default: false }

})

module.exports = mongoose.model("PaymentSchedule", paymentScheduleSchema)