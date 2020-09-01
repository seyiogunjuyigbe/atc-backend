const mongoose = require('mongoose');

const { Schema } = mongoose;

const stateSchema = new Schema({
  name: { type: String, uppercase: true },
  country: { type: Schema.Types.ObjectId, ref: 'Country' },
});

module.exports = mongoose.model('State', stateSchema);
