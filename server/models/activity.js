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
  vendorId: Schema.Types.ObjectId,
  calendarStatus: [{
    month: String,
    status: {
      type: String,
      enum: []
    }
  }],
  hasAccomodation: Boolean,
  hasMeals: Boolean,
  start: Date,
  end: Date,
  countries: [String],
  adventureCategories: [ {
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
  pictures: [String],
  videos: [String],
  route: String,
  stops: {
    stop: String,
    meal: String
  }

});
module.exports = mongoose.model('Activity', activitySchema)
