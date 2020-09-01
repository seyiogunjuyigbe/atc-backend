const mongoose = require('mongoose');

const { Schema } = mongoose;

const Product_cycleSchema = new Schema(
  {
    product: { ref: 'Product', type: Schema.Types.ObjectId, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    availableSlots: { type: Number },
    sellingCycle: { type: Number, required: true },
    waitingCycle: { type: Number, required: true },
    totalSlots: { type: Number, required: true, default: 0 },
    slotsUsed: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['active', 'canceled', 'paused', 'waiting', 'expired'],
      default: 'active',
    },
  },

  {
    timestamps: true,
  }
);
const Product_cycle = mongoose.model('Product_cycle', Product_cycleSchema);
module.exports = Product_cycle;
