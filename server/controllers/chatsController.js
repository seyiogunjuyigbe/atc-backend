const { Chats, Messages } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async sendMessage(req, res) {
    const { participants, message } = req.body;
    try {
      participants.push(req.user._id);
      const chat = await Chats.findOne({ participants: { $in: participants } });
      if (!chat) {
        const newChat = await Chats.create({ participants });
        const newMessage = await Messages.create({
          chatId: newChat._id,
          message,
          sentBy: req.user._id,
        });
        return success(res, 200, {
          message: 'Message Sent',
          newMessage,
        });
      }
      const newMessage = await Messages.create({
        chatId: chat._id,
        message,
        sentBy: req.user._id,
      });
      return success(res, 200, {
        message: 'Message Sent',
        newMessage,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async GetAllActiveChat(req, res) {
    try {
      Chats.find({ participants: req.user._id })
        .populate('participants')
        .exec((err, chat) => {
          if (err) {
            return error(res, 500, err.message);
          }
          return success(res, 200, {
            message: 'Got all active chats',
            chat,
          });
        });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async GetChatMessages(req, res) {
    try {
      Messages.find({ sentBy: req.user._id, chatId: req.params.chatId }).exec(
        (err, chatMessages) => {
          if (err) {
            return error(res, 500, err.message);
          }
          return success(res, 200, {
            message: 'Got all active chats messages',
            chatMessages,
          });
        }
      );
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
