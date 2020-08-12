const router = require("express").Router();
const {
    GetAllActiveChat,
   sendMessage,
  GetChatMessages,
} = require("../controllers/chatsController");

const authenticate = require('../middlewares/authentication');

router.post('/', authenticate,  sendMessage);
router.get('/:chatId', authenticate,  GetChatMessages);
router.get('/', authenticate,  GetAllActiveChat);


module.exports = router;