'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class memberships extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  memberships.init({
    name: DataTypes.STRING,
    type: {
      type:DataTypes.ENUM,
      values: ('one-off','annual')
    },
    createdBy: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'memberships',
  });
  return memberships;
};