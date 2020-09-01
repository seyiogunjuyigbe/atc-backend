const mongoose = require('mongoose');

const { Schema } = mongoose;

const activeChatsSchema = new Schema({
  participants: [{ ref: 'User', type: Schema.Types.ObjectId }],
  message: [{ type: Schema.Types.ObjectId, ref: 'message' }],
});
module.exports = mongoose.model('activeChats', activeChatsSchema);
