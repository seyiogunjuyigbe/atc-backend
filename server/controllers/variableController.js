const { Variable } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async updateVariables(req, res) {
    try {
      let existingVariable = await Variable.findOneAndUpdate(
        { type: 'default' },
        req.body
      );
      if (existingVariable) {
        await existingVariable.save();
      } else {
        existingVariable = await Variable.create({ ...req.body });
      }
      return success(res, 200, {
        message: 'Variables updated',
        existingVariable,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
