const { Variable } = require('../models');

module.exports = {
  async seedvariables() {
    try {
      const existing = await Variable.findOne({ type: 'default' });
      if (existing) console.log('Variables already seeded');
      else {
        await Variable.create({
          type: 'default',
          oneOffMembershipPercent: 21,
          loyaltyPointAllocation: 6,
          productTradingValue: 4,
          productTradingRangeValue: [0, 1, 2, 3, 4],
          productPriceMultiplier: 4,
          productTradingPriceMultiplier: 4,
          transactionFee: 5,
          freeMembershipDiscountDivisor: 2,
          paidMembershipDiscountDivisor: 3,
          annualMembershipFee: 200,
        });
        console.log('Default variables seeded');
      }
    } catch (err) {
      console.log(`Error seeding variables: ${err.message}`);
    }
  },
};
