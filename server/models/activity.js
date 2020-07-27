'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Activity.init({
    dayNumber: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    bestVisitTime: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('bestVisitTime').split(',')
      },
      set(val) {
        this.setDataValue('bestVisitTime', val.join(','));
      },
    },
    bestVisitSeason: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('bestVisitTime').split(',')
      },
      set(val) {
        this.setDataValue('bestVisitTime', val.join(','));
      },
    },
    vendorId: DataTypes.INTEGER,
    bestVisitWeather: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('bestVisitTime').split(',')
      },
      set(val) {
        this.setDataValue('bestVisitTime', val.join(','));
      },
    },
    calendarStatus: {
      type: DataTypes.STRING,
      get: function () {
        return safelyParse(this.getDataValue('calendarStatus'));
      },
      set: function (val) {
        return this.setDataValue('calendarStatus', JSON.stringify(val)) || null
      }
    },
    hasAccomodation: DataTypes.BOOLEAN,
    hasMeals: DataTypes.BOOLEAN,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    countries: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('countries').split(',')
      },
      set(val) {
        this.setDataValue('countries', val.join(','));
      },
    },
    adventureCategories: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('adventureCategories').split(',')
      },
      set(val) {
        this.setDataValue('adventureCategories', val.join(','));
      },
    },
    sightCategories: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('sightCategories').split(',')
      },
      set(val) {
        this.setDataValue('sightCategories', val.join(','));
      },
    },
    mainDestinationCity: DataTypes.STRING,
    mainDestinationCountry: DataTypes.STRING,
    pictures: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('pictures').split(',')
      },
      set(val) {
        this.setDataValue('pictures', val.join(','));
      },
    },
    videos: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('videos').split(',')
      },
      set(val) {
        this.setDataValue('videos', val.join(','));
      },
    },
    route: {
      type: DataTypes.STRING,
      values: ('start', 'end', 'day')
    },
    stops: {
      type: DataTypes.STRING,
      get: function () {
        return safelyParse(this.getDataValue('stops'))
      },
      set(val) {
        this.setDataValue('stops', JSON.stringify(val)) || null
      }
    },
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};

function safelyParse(json) {
  var parsed

  try {
    parsed = JSON.parse(json)
  } catch (e) {
    return [];
  }
  return parsed // Could be undefined!
}