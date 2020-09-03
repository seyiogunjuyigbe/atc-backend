const mongoose = require('mongoose');

const { Schema } = mongoose;

const paymentScheduleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  activeCycle: {
    type: Schema.Types.ObjectId,
    ref: 'ActiveCycle',
  },
  amount: Number,
  chargeDate: Date,
  amountCapturable: Number,
  failedAttempts: {
    type: Number,
    default: 0,
  },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
});

module.exports = mongoose.model('PaymentSchedule', paymentScheduleSchema);