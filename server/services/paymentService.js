const { User, Membership, ProductCycle } = require('../models');

exports.createReference = type => {
  const randomChars = Math.random().toString(32).substr(8);
  let prefix = 'ATC_';
  switch (type) {
    case 'payment':
      prefix += 'PAY';
      break;
    case 'subscription':
      prefix += 'SUB';
      break;
    case 'refund':
      prefix += 'RFD';
      break;
    case 'payout':
      prefix += 'PYT';
      break;
    case 'withdrawal':
      prefix += 'WTD';
      break;
    default:
      prefix = 'DEF';
      break;
  }
  return `${prefix}_${randomChars}_${Date.now()}`.toUpperCase();
};
exports.subscribeMembership = async (membershipId, userId) => {
  try {
    const membership = await Membership.findById(membershipId);
    const user = await User.findById(userId).populate('memberships');
    const { memberships } = user;
    if (membership.type === 'one-off') memberships.push(membership);
    else if (membership.type === 'annual') {
      memberships.length = 0;
      memberships.push(membership);
      user.activeMembership = membership;
      user.membershipExpiry = moment().add(30, 'days');
    } else {
      memberships.push(membership);
    }
    await user.save();
    return user;
  } catch (err) {
    return err;
  }
};
exports.unsubscribeMembership = async (membershipId, userId) => {
  try {
    const membership = await Membership.findById(membershipId);
    const user = await User.findById(userId).populate('memberships');
    user.memberships.pull(membership);
    await user.save();
    return user;
  } catch (err) {
    return err;
  }
};
exports.ProductStatusUpdate = async (activeCycle, action) => {
  if (action !== 'refund' || action !== 'payment') return null;
  try {
    const productCycle = await ProductCycle.findOne({ _id: activeCycle });
    if (action === 'refund') {
      productCycle.slotsUsed -= 1;
      await productCycle.save();
    }
    if (action === 'payment') {
      productCycle.slotsUsed += 1;
      await productCycle.save();
    }
  } catch (err) {
    return err;
  }
};
