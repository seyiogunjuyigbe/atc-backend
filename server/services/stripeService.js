const {
  STRIPE_SECRET_KEY
} = process.env
const stripe = require("stripe")(STRIPE_SECRET_KEY);
module.exports = {
  async createPaymentIntent(transaction, customerId) {
    let { amount, currency, description, transactableType, transactable } = transaction
    try {
      let customer = await stripe.customers.retrieve(customerId)
      if (customer) {
        let intent = await stripe.paymentIntents.create({
          amount,
          currency,
          description,
          customer,
          metadata: {
            type: transactableType,
            id: transactable
          }
        })
        if (intent) return intent
      }

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
  }
}