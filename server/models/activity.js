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
  vendor: Schema.Types.ObjectId,
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
  countries: [String],
  adventureCategories: [{
    ref: "Category",
    type: Schema.Types.ObjectId
  }],
  sightCategories: [
    {
      ref: "Category",
      type: Schema.Types.ObjectId
    }
  ],
  mainDestination: {
    city: String,
    country: String,
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
  }]

});
module.exports = mongoose.model('Activity', activitySchema)
