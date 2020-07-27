'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Subscription.init({
    name: DataTypes.STRING,
    frequency: DataTypes.STRING,
    type: {
      type:DataTypes.ENUM,
      values: ('one-off','annual')
    },
    createdBy: DataTypes.INTEGER,
    subscribableType: {
      type:DataTypes.ENUM,
      values: ('product','membership')
    },
    subscribableId: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
  });
  return Subscription;
};