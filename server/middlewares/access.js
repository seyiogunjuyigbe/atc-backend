const { error } = require('./response');

module.exports = {
  checkIfAdmin(req, res, next) {
    if (!req.user) return error(res, 401, 'No authorization header found');
    if (req.user.role !== 'admin')
      return error(res, 403, 'Unauthorized access');
    next();
  },
  checkIfVendor(req, res, next) {
    if (!req.user) return error(res, 401, 'No authorization header found');
    if (req.user.role !== 'vendor')
      return error(res, 403, 'Unauthorized access');
    next();
  },
  checkIfCustomer(req, res, next) {
    if (!req.user) return error(res, 401, 'No authorization header found');
    if (req.user.role !== 'customer')
      return error(res, 403, 'Unauthorized access');
    next();
  },
};
