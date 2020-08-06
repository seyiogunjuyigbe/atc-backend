'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String
  },
  occurrence: {
    type: String,
    enum: ['common', 'rare', 'occasional'],
  },
  name: {
    type: String
  },
  contents: [String],
  type: {
    type: String,
    enum: ['adventure', 'top-sight']
  }
},
  {
    timestamps: true
  }
);
const category = mongoose.model('category', categorySchema);

module.exports = category;

// const
