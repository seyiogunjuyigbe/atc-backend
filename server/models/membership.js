const mongoose = require('mongoose');

const { Schema } = mongoose;

const membershipsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['default', 'one-off', 'annual'],
    },
    name: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    cost: { type: Number, required: true },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const memberships = mongoose.model('Membership', membershipsSchema);

module.exports = memberships;
