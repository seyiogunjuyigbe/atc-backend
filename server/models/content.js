'use strict';
const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const ContentSchema = new Schema( {
    type : {
      type : String ,
      enum : [ 'video' , 'image' , 'gif' ]
    } ,
    forType : {
      type : String
    } ,
    forId : {
      type : mongoose.Schema.Types.ObjectId
    } ,
    url : {
      type : String
    }
  } ,
  {
    timestamps : true
  }
);
const Content = mongoose.model( 'Content' , ContentSchema );

module.exports = Content;

// const
