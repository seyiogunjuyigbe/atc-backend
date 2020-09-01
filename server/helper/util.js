const bcrypt = require('bcryptjs');

const env = process.env.NODE_ENV || 'development';
const uuidv1 = require('uuid/v1');

const utilities = {
  get_password: () => {
    const password = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 8);
    const hashed_password = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(8),
      null
    );

    return {
      password,
      hashed_password,
    };
  },

  getURL: () => {
    if (env == 'development') {
      return 'http://localhost:8080/';
    }
    return 'http://africantravelclub.com/';
  },
};

module.exports = utilities;
