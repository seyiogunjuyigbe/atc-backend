'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const watchSchema = new Schema({
  product: { ref: "Product", type: Schema.Types.ObjectId},
  clientId: { type: String, required: true},
  claim: { type: Number},
  dayslimit: { type: Number}
});
module.exports = mongoose.model('watch', watchSchema)
