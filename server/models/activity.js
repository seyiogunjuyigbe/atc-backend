'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySchema = new Schema({
  title: String,
  dayNumber: Number,
  description: String,
  bestVisitTime: [String],
  bestVisitSeason: [String],
  bestVisitWeather: [String],
  vendor: { type: Schema.Types.ObjectId, ref: "User" },
  calendarStatus: [{
    month: String,
    status: {
      type: String,
      enum: ['good', 'excellent', 'fair'],
    }
  }],
  hasAccomodation: String,
  hasMeals: String,
  start: Date,
  end: Date,
  countries: [{
    type: Schema.Types.ObjectId,
    ref: "Country"
  }],
  product: {
    ref: "Product",
    type: Schema.Types.ObjectId
  },
  adventureCategories: [{
    type: Schema.Types.ObjectId,
    ref: "Category"
  }],
  sightCategories: [
    {
      type: Schema.Types.ObjectId, ref: "Category"
    }
  ],
  mainDestination: {
    city: { type: Schema.Types.ObjectId, ref: 'State' },
    country: { type: Schema.Types.ObjectId, ref: 'Country' }
  },
  contents: [{
    type: Schema.Types.ObjectId,
    ref: 'Content',
  }],
  route: {
    type: String,
    enum: ['start', 'day', 'end'],
  },
  stops: [{
    stop: String,
    meal: String
  }],
  marketingExpiryDate: Date,
  marketingPriority: Number
});
module.exports = mongoose.model('Activity', activitySchema)
