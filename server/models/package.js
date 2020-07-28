'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PackageSchema = new Schema({
  name: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  length_value: Number,
  frequency: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years']
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});
const Package = mongoose.model('Package', PackageSchema);

module.exports = Package;

// const