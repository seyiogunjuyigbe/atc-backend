const mongoose = require('mongoose');

const { Schema } = mongoose;

const PackageSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    length: Number,
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Package = mongoose.model('Package', PackageSchema);

module.exports = Package;

// const
