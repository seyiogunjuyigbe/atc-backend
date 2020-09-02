const router = require('express').Router();
const {
  webhook,
  fetchPurchaseStats,
} = require('../controllers/paymentController');
const authenticate = require('../middlewares/authentication');

router.post('/webhook', authenticate, webhook);
router.get('/purchase-stats', fetchPurchaseStats);

module.exports = router;
