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
    paymentIntent: Object,
    amountCapturable: Number


})

module.exports = mongoose.model("PaymentSchedule", paymentScheduleSchema)