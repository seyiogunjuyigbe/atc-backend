const mongoose = require('mongoose');

const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    type: {
      type: String,
      default: 'payment',
      enum: ['payment', 'subscription', 'refund', 'payout'],
    },
    refund: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    status: {
      type: String,
      default: 'pending',
      enum: [
        'pending',
        'successful',
        'cancelled',
        'failed',
        'refunded',
        'settled',
      ],
    },
    reference: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'stripe',
    },
    providerReference: {
      type: String,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    paymentType: {
      type: String,
      default: 'card',
    },
    amount: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activeCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product_cycle',
      // required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    /* card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
  }, */
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      // required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    transactableType: {
      type: String,
      enum: ['Product', 'Membership'],
      // required: true,
    },
    transactable: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'transactableType',
      // required: true,
    },
    description: {
      type: String,
    },
    stripePaymentId: {
      type: String,
    },
    transferwiseId: String,
    settleDate: Date,
  },
  {
    timestamps: true,
  }
);
const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;

// const
