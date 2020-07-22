const jwt = require("jsonwebtoken"),
credential = require("../config/config");

module.exports = {
  generateToken: payload => {
    try {
      const token = jwt.sign(payload, credential.jwtSecret, {
        expiresIn: credential.tokenExpiresIn
      });
      return token;
    } catch (error) {
      console.log(err);
      return err;
    }
  },

  decodeToken: (token, callback) => {
    try {
      jwt.verify(token, credential.jwtSecret, (err, decoded) => {
        if (err) return callback(err);
        return callback(false, decoded);
      });
    } catch (error) {
      console.log(err);
      return err;
    }
  }
};
