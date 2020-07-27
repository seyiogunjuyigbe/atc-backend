'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNo: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    isActive:{
     type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    role:  {
        type:DataTypes.ENUM,
        values: ('admin','vendor','customer')
      },
    passwordResetExpires: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  });

    //exclude password
    User.prototype.toJSON =  function () {
      var values = Object.assign({}, this.get());
    
      delete values.password;
      
      return values;
    }
  return User;
};
