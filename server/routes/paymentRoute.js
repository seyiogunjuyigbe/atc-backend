const router = require("express").Router();
const { webhook } = require('../controllers/paymentController');
const authenticate = require('../middlewares/authentication')
router.post('/webhook', authenticate, webhook);
module.exports = router;