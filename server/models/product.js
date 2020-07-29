'use strict';
const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const ProductSchema = new Schema( {
    name : {
      type : String
    } ,
    productCategory : {
      type : mongoose.Schema.ObjectId
    } ,
    isMainProduct : {
      type : Boolean ,
      default: false,
    } ,
    imageUrl : {
      type : String
    } ,
    shortName : {
      type : String
    } ,
    packageID : {
      type : mongoose.Schema.ObjectId ,
      required : true
    } ,
    owner : {
      type : mongoose.Schema.Types.ObjectId
    } ,
    description : {
      type : String
    }
  } ,
  {
    timestamps : true
  }
);
const Product = mongoose.model( 'Product' , ProductSchema );

module.exports = Product;

// const


