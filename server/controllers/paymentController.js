const { STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const moment = require('moment');
const Transaction = require('../models/transaction');
const { success, error } = require('../middlewares/response');
const {
  subscribeMembership,
  unsubscribeMembership,
  ProductStatusUpdate,
} = require('../services/paymentService');
const stripeService = require('../services/stripeService');

module.exports = {
  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let WEBHOOK_SECRET;
    try {
      let { data } = await stripe.webhookEndpoints.list();
      if (data.length > 0) {
        data = data.find(x => {
          return x.url.startsWith(String(req.headers.host));
        });
      }
      if (!data) {
        const newhook = await stripeService.createWebhookEndpoint();
        WEBHOOK_SECRET = newhook.secret;
      } else {
        WEBHOOK_SECRET = data.secret;
      }
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        WEBHOOK_SECRET
      );
      const currentTransaction = await Transaction.findOne({
        stripePaymentId: event.data.object.id,
      });
      let intent;
      if (event && event.data && event.data.object) {
        if (event.type === 'payment_intent.succeeded') {
          intent = event.data.object;
          currentTransaction.set({ status: 'successful', paidAt: new Date() });
          if (
            currentTransaction.transactableType === 'Product' &&
            currentTransaction.type === 'payment'
          ) {
            currentTransaction.settleDate = moment().add(
              currentTransaction.transactable.cancellationDaysLimit,
              'days'
            );
          }
          if (
            currentTransaction.transactableType === 'Membership' &&
            currentTransaction.type === 'subscription'
          ) {
            await subscribeMembership(
              currentTransaction.transactable,
              req.user.id
            );
          }
          if (
            currentTransaction.transactableType === 'Product' &&
            currentTransaction.type === 'payment'
          ) {
            await ProductStatusUpdate(
              currentTransaction.activeCycle,
              'payment'
            );
          }
          if (
            currentTransaction.transactableType === 'Membership' &&
            currentTransaction.type === 'refund'
          ) {
            await unsubscribeMembership(
              currentTransaction.transactable,
              currentTransaction.customer
            );
          }
          if (
            currentTransaction.transactableType === 'Product' &&
            currentTransaction.type === 'refund'
          ) {
            await ProductStatusUpdate(currentTransaction.activeCycle, 'refund');
          }
          await currentTransaction.save();

          return success(res, 200, { success: true, intent: intent.id });
        }
        if (event.type === 'payment_intent.payment_failed') {
          intent = event.data.object;
          const message =
            intent.last_payment_error && intent.last_payment_error.message;
          currentTransaction.set({ status: 'failed' });
          await currentTransaction.save();
          return error(res, 500, {
            success: false,
            intent: intent.id,
            message,
          });
        }
      } else {
        console.log(event);
        return error(res, 500, { success: false, event });
      }
    } catch (err) {
      return error(res, 401, 'Invalid signature');
    }
  },
  async fetchPurchaseStats(req, res) {
    const { featureType, featureId, hours } = req.query;
    console.log(hours);
    try {
      let purchases = await Transaction.find({
        type: 'payment',
        transactableType: featureType,
        transactable: featureId,
        $or: [{ status: 'successful' }, { status: 'settled' }],
      });
      purchases = purchases.filter(purchase => {
        return (
          Math.round(
            moment.duration(moment().diff(moment(purchase.paidAt))).asHours()
          ) <= Number(hours)
        );
      });
      return success(res, 200, {
        count: purchases.length,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
