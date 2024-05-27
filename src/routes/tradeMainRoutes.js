const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getMarketData } = require('../controllers/trade-main/tradeMain');

// Route to fetch market data
router.get('/:marketType', authenticate, getMarketData);

module.exports = router;
