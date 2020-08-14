const { User, Membership, Transaction } = require('../models')
exports.createReference = (type) => {
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
    case 'payout':
      prefix += 'PYT';
      break;
    default:
      prefix = 'DEF';
      break;
  }
  return `${prefix}_${randomChars}_${Date.now()}`.toUpperCase();
}
exports.subscribeMembership = async (membershipId, userId) => {
  try {
    let membership = await Membership.findById(membershipId);
    let user = await User.findById(userId).populate('memberships');
    let { memberships } = user
    if (membership.type == "one-off") memberships.push(membership)
    else if (membership.type == "annual") {
      memberships.length = 0;
      memberships.push(membership)
    }
    else {
      memberships.push(membership)
    }
    await user.save();
    return user
  } catch (err) {
    return err
  }
}
exports.unsubscribeMembership = async (membershipId, userId) => {
  try {
    let membership = await Membership.findById(membershipId);
    let user = await User.findById(userId).populate('memberships');
    user.memberships.pull(membership);
    await user.save();
    return user
  } catch (err) {
    return err
  }
}