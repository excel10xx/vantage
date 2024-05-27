const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getUserTrades } = require('../controllers/trade-history/tradeHistory');

// Route to fetch user trades
router.get('', authenticate, getUserTrades);

module.exports = router;
