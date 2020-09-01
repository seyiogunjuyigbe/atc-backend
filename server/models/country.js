const mongoose = require('mongoose');

const { Schema } = mongoose;

const countrySchema = new Schema({
  name: { type: String, uppercase: true },
  states: [
    {
      type: Schema.Types.ObjectId,
      ref: 'State',
    },
  ],
});

module.exports = mongoose.model('Country', countrySchema);
