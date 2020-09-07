const { createDefaultMembersip } = require('./membership');
const { createStates } = require('./country');
const { seedvariables } = require('./variable');

module.exports = () => {
  createDefaultMembersip();
  createStates();
  seedvariables();
};
