'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberProductSchema = new Schema({
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
    status: {
        type: String,
        enum: ["neverBought", "partialPayment", "completePayment"]
    }

})

module.exports = mongoose.model("MemberProduct", memberProductSchema)