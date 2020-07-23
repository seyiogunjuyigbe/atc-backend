'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
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
    getterMethods: {
      fullName(){
        return [this.firstName, this.lastName].join(' ');
      }
    }
  });
  users.associate = function(models) {
    // associations can be defined here
  };

   //exclude password
    users.prototype.toJSON =  function () {
      var values = Object.assign({}, this.get());
    
      delete values.password;
      
      return values;
    }
  return users;
};