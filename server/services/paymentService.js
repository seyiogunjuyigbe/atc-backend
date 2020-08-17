const {User, Membership, Transaction, Product, ProductCycle} = require('../models')
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
    let {memberships} = user
    if (membership.type == "one-off") memberships.push(membership)
    else if (membership.type == "annual") {
      memberships.length = 0;
      memberships.push(membership)
    } else {
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
exports.ProductStatusUpdate = async (activeCycle, action) => {
  if (action !== "refund" || action !== "payment") return null;
  try {
    const productCycle = await ProductCycle.findOne({_id: activeCycle})
    const product = await Product.findOne({_id: productCycle.product})
    if (action === "refund") {
      productCycle.slotsUsed = productCycle.slotsUsed - 1;
      await productCycle.save()
      await product.save()
    }
    if (action === "payment") {
      product.slotsUsed = productCycle.slotsUsed + 1;
      await productCycle.save()
      await product.save()
    }
  } catch (err) {
    return err
  }
}