const mongoose = require('mongoose');

const { Schema } = mongoose;
const variableSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    values: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Variable', variableSchema);
