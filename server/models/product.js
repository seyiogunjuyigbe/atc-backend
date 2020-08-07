'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
      type: String
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
      type: String
    },
    defaultUrgency: {
      type: Number,
    },
    shortName: {
      type: String
    },
    sellingCycle:{type: Number},
    waitingCycle:{type: Number},
    status: {
      type: String,
      enum: ["active", "canceled", "paused", "waiting", "expired"],
      default: "active"
    },
    activeCycle: {
      ref: "Product_cycle",
      type: mongoose.Schema.ObjectId
    },
    startDate: {type: Date},
    endDate: {type: Date},
    packageID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },
    cancellationDaysLimit: {
      type: Number,
    },
    activities: [{type: Schema.Types.ObjectId, ref: 'Activity'}],
    owner: {
      type: mongoose.Schema.Types.ObjectId
    },
    description: {
      type: String
    },
    customPrices: [{
      range: [Number],
      prices: {
        vendorPrice: Number,
        childrenPrice: Number,
        productPrice: Number,
        freeMembershipDiscountedPrice: Number,
        paidMembershipDiscountedPrice: Number,
        oneOffMembershipFee: Number,
      }
    }],
    marketingExpiryDate: Date,
    marketingPriority: Number,
    price: {
      adult: Number,
      children: Number,
      actual: Number
    }
  },

  {
    timestamps: true
  }
);
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;

