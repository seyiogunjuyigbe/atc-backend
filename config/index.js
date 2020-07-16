require('dotenv').config();
const config = require('config');
const path = require('path');

// check if any strings defined in configuration are names of environmental
// variables and substitute them with the actual values:
module.exports = (function convert(obj) {
  Object.keys(obj).forEach((key) => {
    let value = obj[key];

    if (typeof(value) === "object" && value !== null) {
      value = convert(value);
    } else if (typeof(value) === "string") {
      if (value.match(/^\\/)) {
        value = value.replace(/^\\/, "");
      } else if (process.env[value] !== undefined) {
        value = process.env[value];
      }

      // convert relative paths into absolute ones:
      if (value.match(/^\.\.?/)) {
        value = path.resolve(config.util.getEnv("NODE_CONFIG_DIR"), value);
      }
    }

    obj[key] = value;

  });

  return obj;
})(config);
