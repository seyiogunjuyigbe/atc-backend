const {STRIPE_SECRET_KEY} = process.env
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const Transaction = require('../models/transaction')
const {success, error} = require("../middlewares/response");
const {subscribeMembership, unsubscribeMembership, ProductStatusUpdate} = require('../services/paymentService');
const stripeService = require('../services/stripeService')
module.exports = {

  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let WEBHOOK_SECRET;
    try {
      let {data} = await stripe.webhookEndpoints.list();
      if (data.length > 0) {
        data = data.find(x => {
          return x.url.startsWith(String(req.headers.host))
        })
      }

      if (!data) {
        let newhook = await stripeService.createWebhookEndpoint();
        WEBHOOK_SECRET = newhook.secret
      } else {
        WEBHOOK_SECRET = data.secret
      }
      let event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
      let currentTransaction = await Transaction.findOne({stripePaymentId: event.data.object.id})
      let intent;
      if (event && event.data && event.data.object) {
        if (event['type'] === 'payment_intent.succeeded') {
          intent = event.data.object;
          currentTransaction.set({status: "successful"});
          await currentTransaction.save();
          if (currentTransaction.transactableType === "Membership" && currentTransaction.type === "subscription") {
            await subscribeMembership(currentTransaction.transactable, req.user.id);
          }
          if(currentTransaction.transactableType === "Product" && currentTransaction.type === "payment") {
            await ProductStatusUpdate(currentTransaction.activeCycle, "payment")
          }
          if (currentTransaction.transactableType === "Membership" && currentTransaction.type === "refund") {
            await unsubscribeMembership(currentTransaction.transactable, currentTransaction.customer);
          }
          if(currentTransaction.transactableType === "Product" && currentTransaction.type === "refund") {
            await ProductStatusUpdate(currentTransaction.activeCycle, "refund")
          }
          return success(res, 200, {success: true, intent: intent.id});
        } else if (event['type'] === 'payment_intent.payment_failed') {
          intent = event.data.object;
          const message = intent.last_payment_error && intent.last_payment_error.message;
          currentTransaction.set({status: "failed"});
          await currentTransaction.save()
          return error(res, 500, {success: false, intent: intent.id, message});
        }
      } else {
        console.log(event)
        return error(res, 500, {success: false, event});
      }
    } catch (err) {
      return error(res, 401, 'Invalid signature')
    }

  }
}

