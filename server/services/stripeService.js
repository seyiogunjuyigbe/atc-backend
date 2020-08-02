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
      }
      let customer = await stripe.customers.retrieve(user.stripeCustomerId)
      if (customer) {
        let intent = await stripe.paymentIntents.create({
          amount,
          currency,
          description,
          customer,
          metadata: {
            type: transactableType,
            id: transactable,
            ref: transaction.reference
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