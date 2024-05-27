const express = require('express');
const router = express.Router();
const { getUserCopyTradingData } = require('../controllers/copytrading-portfolio/copyTradingPortfolio');
const authenticate = require('../middleware/authenticate');

router.get('/:marketType', authenticate, getUserCopyTradingData);

module.exports = router;
