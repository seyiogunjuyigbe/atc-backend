const {
  STRIPE_SECRET_KEY
} = process.env
const stripe = require("stripe")(STRIPE_SECRET_KEY);

module.exports = {
  async createPaymentIntent(amount, description, customer) {
    try {
      let intent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        description,
        customer
      })
      if (intent) return intent
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
  }
}