const { Variable } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async updateVariables(req, res) {
    try {
      let variable = await Variable.findOneAndUpdate(
        { type: 'default' },
        { ...req.body }
      );
      if (variable) {
        await variable.save();
      } else {
        variable = await Variable.create({ ...req.body, type: 'default' });
      }
      const newVariables = await Variable.findOne({ type: 'default' });
      return success(res, 200, {
        message: 'Variables updated',
        variable: newVariables,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchVariables(req, res) {
    try {
      const variable = await Variable.findOne({ type: 'default' });
      return success(res, 200, {
        variable,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  fetchVariablesAsObj() {
    Variable.findOne({ type: 'default' })
      .then(variables => {
        const {
          oneOffMembershipPercent,
          loyaltyPointAllocation,
          productTradingValue,
          productTradingRangeValue,
          productPriceMultiplier,
          productTradingPriceMultiplier,
          transactionFee,
          freeMembershipDiscountDivisor,
          paidMembershipDiscountDivisor,
          annualMembershipFee,
        } = variables;
        return {
          oneOffMembershipPercent,
          loyaltyPointAllocation,
          productTradingValue,
          productTradingRangeValue,
          productPriceMultiplier,
          productTradingPriceMultiplier,
          transactionFee,
          freeMembershipDiscountDivisor,
          paidMembershipDiscountDivisor,
          annualMembershipFee,
        };
      })
      .catch(err => {
        return err.message;
      });
  },
};
