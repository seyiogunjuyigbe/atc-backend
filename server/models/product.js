const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
      enum: ['main', 'upsell', 'downsell', 'order-bump', 'cross-sell'],
    },
    isMainProduct: {
      type: Boolean,
      default: false,
    },
    hasAirportTransfer: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
    },
    defaultUrgency: {
      type: Number,
    },
    shortName: {
      type: String,
    },
    sellingCycle: { type: Number, required: true },
    waitingCycle: { type: Number, required: true },
    endDate: { type: Date, required: true },
    startDate: { type: Date, default: new Date() },
    pauseDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'waiting', 'expired', 'paused', 'canceled'],
      default: 'active',
    },
    marketingExpiryDate: {
      type: Date,
    },
    marketingPriority: Number,
    package: {
      type: mongoose.Schema.ObjectId,
      ref: 'Package',
    },
    activeCycle: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product_cycle',
    },
    cancellationDaysLimit: {
      type: Number,
    },
    activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
    },
    customPrices: [
      {
        range: [Number],
        prices: {
          vendorPrice: Number,
          childrenPrice: Number,
          productAdultPrice: Number,
          freeMembershipDiscountedPrice: Number,
          paidMembershipDiscountedPrice: Number,
          oneOffMembershipFee: Number,
          annualMembershipFee: { type: Number, default: 200 },
        },
      },
    ],
    stats: {
      views: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
