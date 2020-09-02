const { Membership } = require('../models');

module.exports = {
  async defaultMembership() {
    try {
      let existing = await Membership.findOne({ type: 'default' });
      if (!existing) {
        existing = await Membership.create({
          type: 'default',
          price: 0,
          description: 'Default membership for all',
          name: 'Default',
        });
      }
      return existing;
    } catch (err) {
      return err;
    }
  },
};
