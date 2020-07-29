'use strict';
const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const categorySchema = new Schema( {
    parentId:{
      type : mongoose.Schema.Types.ObjectId ,
    },
    description :{
      type: String
    },
    name: {
      type: String
    }
  } ,
  {
    timestamps : true
  }
);
const category = mongoose.model( 'category' , categorySchema );

module.exports = category;

// const
