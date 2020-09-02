const mongoose = require('mongoose');

const { Schema } = mongoose;

const installmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  recurringAmount: Number,
  recurrentCount: Number,
  maxNoOfInstallments: Number,
  isCompleted: Boolean,
  lastChargeDate: Date,
  nextChargeDate: Date,
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  ],
  amountCapturable: Number,
  failedAttempts: {
    type: Number,
    default: 0,
  },
  paidAt: Date,
});

module.exports = mongoose.model('Installment', installmentSchema);
