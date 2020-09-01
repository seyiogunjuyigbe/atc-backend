const { STRIPE_SECRET_KEY, FRONTEND_URL } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const { User } = require('../models');

module.exports = {
  async createPaymentIntent(transaction, user) {
    const {
      amount,
      currency,
      description,
      transactableType,
      transactable,
    } = transaction;
    try {
      if (!user.stripeCustomerId) {
        const customerDetails = await this.createCustomer(user);
        if (customerDetails && customerDetails.id) {
          user.stripeCustomerId = customerDetails.id;
        }
        await user.save();
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
          ref: transaction.reference,
        },
      });
    } catch (err) {
      return err;
    }
  },
  async refundPayment(charge) {
    try {
      const refund = await stripe.refunds.create({
        charge,
      });
      if (refund) return refund;
    } catch (err) {
      return err;
    }
  },
  async createCustomer(user) {
    const { firstName, lastName, phone, email } = user;
    try {
      const newCustomer = await stripe.customers.create({
        name: `${firstName} ${lastName}`,
        phone,
        email,
      });
      if (newCustomer) {
        return newCustomer;
      }
    } catch (err) {
      return err;
    }
  },
  async createWebhookEndpoint() {
    try {
      const endpoint = await stripe.webhookEndpoints.create({
        url: `${FRONTEND_URL}/payments/webhook`,
        enabled_events: [
          'payment_intent.amount_capturable_updated',
          'payment_intent.canceled',
          'payment_intent.created',
          'payment_intent.payment_failed',
          'payment_intent.processing',
          'payment_intent.succeeded',
        ],
      });
      return endpoint;
    } catch (err) {
      return err;
    }
  },
  /*
   * TODO: SEYI
   * `saveAccountId` is undefined
   * `res` is undefined
   */
  // async addVendorAccount(user, code) {
  //   try {
  //     const response = await stripe.oauth.token({
  //       grant_type: 'authorization_code',
  //       code,
  //     });
  //
  //     const connected_account_id = response.stripe_user_id;
  //     saveAccountId(connected_account_id);
  //     // Render some HTML or redirect to a different page.
  //     return res.status(200).json({ success: true });
  //   } catch (err) {
  //     if (err.type === 'StripeInvalidGrantError') {
  //       return res
  //         .status(400)
  //         .json({ error: `Invalid authorization code: ${code}` });
  //     }
  //     return res.status(500).json({ error: 'An unknown error occurred.' });
  //   }
  // },
};
