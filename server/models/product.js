'use strict';
const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const ProductSchema = new Schema( {
    name: {
      type: String
    },
    imageUrl: {
      type: String
    },
    shortName: {
      type: String
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId
    },
    description: {
      type: String
    }
  } ,
  {
    timestamps : true
  }
);
const Product = mongoose.model( 'Product' , ProductSchema );

module.exports = Product;

// const


