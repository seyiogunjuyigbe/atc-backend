'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messagesSchema = new Schema({
  chatId: {type: Schema.Types.ObjectId},
  message: {type: String },
  sentBy: {type: Schema.Types.ObjectId, ref: "User"}
});
module.exports = mongoose.model('messages', messagesSchema)