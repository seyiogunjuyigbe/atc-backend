// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Package extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   };
//   Package.init({
//     name: DataTypes.STRING,
//     createdBy: DataTypes.INTEGER,
//     description: DataTypes.STRING,
//     features: {
//       type: DataTypes.STRING,
//       get() {
//         return this.getDataValue('features').split(',')
//       },
//       set(val) {
//         this.setDataValue('features', val.join(','));
//       },
//     },
//     price: DataTypes.INTEGER
//   }, {
//     sequelize,
//     modelName: 'Package',
//   });
//   return Package;
// };


'use strict';
const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const PackageSchema = new Schema( {
    name : {
      type : String
    } ,
    createdBy : {
      type : mongoose.Schema.Types.ObjectId
    } ,
    description : {
      type : String
    },
    features: []
  } ,
  {
    timestamps : true
  }
);
const Package = mongoose.model( 'Package' , PackageSchema );

module.exports = Package;

// const


