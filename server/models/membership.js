'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const membershipsSchema = new Schema({
  type: {
    type: String,
    enum: ['default', 'one-off', 'annual']
  },
  name: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  cost: Number,
  description: {
    type: String
  }
},
  {
    timestamps: true
  }
);
const memberships = mongoose.model('memberships', membershipsSchema);

module.exports = memberships;

// const


