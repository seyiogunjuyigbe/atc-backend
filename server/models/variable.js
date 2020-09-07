const mongoose = require('mongoose');

const { Schema } = mongoose;
const variableSchema = new Schema(
  {
    oneOffMembershipPercent: Number,
    loyaltyPointAllocation: Number,
    productTradingValue: Number,
    productTradingRangeValue: [Number],
    productPriceMultiplier: Number,
    productTradingPriceMultiplier: Number,
    transactionFee: Number,
    freeMembershipDiscountDivisor: Number,
    paidMembershipDiscountDivisor: Number,
    annualMembershipFee: Number,
    type: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Variable', variableSchema);
