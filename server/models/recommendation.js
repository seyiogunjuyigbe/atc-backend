const mongoose = require('mongoose');

const { Schema } = mongoose;

const recommendationSchema = new Schema({
  featureType: {
    type: String,
    enum: ['Product', 'Activity'],
    required: true,
  },
  featureId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: String,
  date: {
    type: Date,
    default: new Date(),
  },
});
module.exports = mongoose.model('Recommendation', recommendationSchema);
