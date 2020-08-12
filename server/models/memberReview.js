'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewsSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  video: { type: String },
  image: { type: String },
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  activity: {ref: "Activity", type: Schema.Types.ObjectId, required: true},
  product: {ref: "Product", type: Schema.Types.ObjectId}
}, {
  timestamps: true
});
module.exports = mongoose.model('membersReviews', reviewsSchema)
