const { STRIPE_SECRET_KEY, FRONTEND_URL } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const { User } = require('../models');

module.exports = {
  async createPaymentIntent(transaction, user, amount_capturable) {
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
      const obj = {
        amount,
        currency,
        description,
        customer: user.stripeCustomerId,
        metadata: {
          type: transactableType,
          id: transactable.toString(),
          ref: transaction.reference,
        },
        setup_future_usage: 'off_session',
      };
      if (amount_capturable) {
        obj.amount = amount_capturable;
      }
      return await stripe.paymentIntents.create(obj);
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
  async createOfflineIntent(transaction, user) {
    const {
      amount,
      currency,
      description,
      transactableType,
      transactable,
    } = transaction;
    try {
      console.log('Creating intent');
      const paymentMethod = await this.fetchPaymentMethod(user);
      if (!paymentMethod) {
        console.log(`No payment method found for ${user.email}`);
        return null;
      }

      console.log(`payment method found for ${user.email}`);
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        description,
        customer: user.stripeCustomerId,
        payment_method: paymentMethod.id,
        off_session: true,
        confirm: true,
        metadata: {
          type: transactableType,
          id: transactable.toString(),
          ref: transaction.reference,
        },
      });
      if (intent) console.log('Intent created');
      return intent;
    } catch (err) {
      console.log({ err: err.message });
      return err;
    }
  },
  async fetchPaymentMethod(user) {
    try {
      const paymentMethod = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });
      return paymentMethod.data[0];
    } catch (err) {
      return err.message;
    }
  },
};
