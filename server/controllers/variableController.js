const { Variable } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async createVariables(req, res) {
    try {
      const variable = await Variable.create({ ...req.body });
      return success(res, 200, {
        message: 'Variables created',
        variable,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async updateVariables(req, res) {
    try {
      const variable = await Variable.findOne({
        type: req.params.variableType,
      });
      if (!variable) {
        return error(res, 404, 'Invalid variable type selected');
      }
      variable.set({ values: req.body });
      await variable.save();

      return success(res, 200, {
        message: 'Variables updated',
        variable,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchAllVariables(req, res) {
    try {
      const variables = await Variable.find({});
      return success(res, 200, {
        variables,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchSingleVariableType(req, res) {
    try {
      const variables = await Variable.findOne({
        type: req.params.variableType,
      });
      return success(res, 200, {
        variables,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
