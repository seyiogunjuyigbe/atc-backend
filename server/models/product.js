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
  cycleNumber: { type: Number , required: true},
  endDate: { type: Date },
  startDate: { type: Date },
  statues: { type: String, enum: ["active","wating","expired"]},
  packageID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Package',
    required: true
  },
  cancellationDaysLimit: {
    type: Number,
  },
  activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
  owner: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String
  }
},
  {
    timestamps: true
  }
);
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

// const


