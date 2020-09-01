const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {};
    /**
     * TODO: SEYI
     * Rewrite the logic here. If you are using the `.map` construct,
     * you are telling the person reading your code that you want
     * to construct a new array, I can't see that here.
     * Perhaps, you meant to use `.forEach`
     */
    // eslint-disable-next-line
    errors.array().map(err => (error[err.param] = err.msg));
    return res.status(400).json({
      error,
    });
  }
  next();
};
