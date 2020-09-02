const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    name: {
      type: String,
    },
    frequency: {
      type: String,
    },
    type: {
      type: String,
      enum: ['one-off', 'annual'],
    },
    subscribableId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    subscribableType: {
      type: String,
      enum: ['Subscription', 'membership'],
    },
    shortName: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;

// const
