const { Variable } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async updateVariables(req, res) {
    try {
      let variable = await Variable.findOneAndUpdate(
        { type: 'default' },
        req.body
      );
      if (variable) {
        await variable.save();
      } else {
        variable = await Variable.create({ ...req.body });
      }
      return success(res, 200, {
        message: 'Variables updated',
        variable,
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
  async fetchVariablesAsObj() {
    try {
      const variable = await Variable.findOne({ type: 'default' });
      return variable;
    } catch (err) {
      return err.message;
    }
  },
};
