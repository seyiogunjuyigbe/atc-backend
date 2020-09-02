const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
    },
    occurrence: {
      type: String,
      enum: ['common', 'rare', 'occasional'],
    },
    name: {
      type: String,
    },
    contents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Content',
      },
    ],
    type: {
      type: String,
      enum: ['adventure', 'top-sight'],
    },
  },
  {
    timestamps: true,
  }
);
const category = mongoose.model('Category', categorySchema);

module.exports = category;

// const
