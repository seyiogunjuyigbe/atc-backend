const mongoose = require('mongoose');

const { Schema } = mongoose;
const walletSchema = new Schema({
  balance: Number,
  previousBalance: Number,
  loyaltyPoints: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Wallet', walletSchema);
