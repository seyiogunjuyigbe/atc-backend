const mongoose = require('mongoose');

const { Schema } = mongoose;

const watchSchema = new Schema({
  product: { ref: 'Product', type: Schema.Types.ObjectId },
  clientId: { type: String, required: true },
  claim: { type: Number, required: true },
  dayslimit: { type: Number, required: true },
});
module.exports = mongoose.model('watch', watchSchema);
