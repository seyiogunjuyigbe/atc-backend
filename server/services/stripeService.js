const {
  STRIPE_SECRET_KEY
} = process.env
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const { User } = require('../models')
module.exports = {
  async createPaymentIntent(transaction, user) {
    let { amount, currency, description, transactableType, transactable } = transaction
    try {
      if (!user.stripeCustomerId) {
        let customerDetails = await this.createCustomer(user);
        if (customerDetails && customerDetails.id) {
          user.stripeCustomerId = customerDetails.id
        }
        await user.save()
        user = await User.findById(user.id); // to reload
      }

      return await stripe.paymentIntents.create({
        amount,
        currency,
        description,
        customer: user.stripeCustomerId,
        metadata: {
          type: transactableType,
          id: transactable.toString(),
          ref: transaction.reference
        }
      });
    } catch (err) {
      return err
    }
  },
  async refundPayment(charge) {
    try {
      let refund = await stripe.refunds.create({
        charge
      })
      if (refund) return refund
    } catch (err) {
      return err
    }
  },
  async createCustomer(user) {
    const { firstName, lastName, phone, email } = user
    try {
      let newCustomer = await stripe.customers.create({ name: `${firstName} ${lastName}`, phone, email });
      if (newCustomer) {
        return newCustomer
      }
    } catch (err) {
      return err
    }
  },
  async addVendorAccount(user, code) {
    try {
      let response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code
      })
      var connected_account_id = response.stripe_user_id;
      saveAccountId(connected_account_id);
      // Render some HTML or redirect to a different page.
      return res.status(200).json({ success: true });
    } catch (err) {
      if (err.type === 'StripeInvalidGrantError') {
        return res.status(400).json({ error: 'Invalid authorization code: ' + code });
      } else {
        return res.status(500).json({ error: 'An unknown error occurred.' });
      }
    }
  }
}
