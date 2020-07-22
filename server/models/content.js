'use strict';
module.exports = (sequelize, DataTypes) => {
  const content = sequelize.define('content', {
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
  type:{
    type: DataTypes.ENUM('video','image','gif'),
  },
  forType: DataTypes.STRING,
  forId:DataTypes.INTEGER,
  createdAt:{
    type:DataTypes.DATE,
    default: Date.now()
  }  ,
  updatedAt: DataTypes.DATE,
  deletedAt: DataTypes.DATE
  }, {});
  content.associate = function(models) {
    // associations can be defined here

  };
  return content;
};