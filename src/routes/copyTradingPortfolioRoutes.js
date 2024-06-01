const express = require('express');
const router = express.Router();
const { getUserCopyTradingData } = require('../controllers/copytrading-portfolio/copyTradingPortfolio');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, getUserCopyTradingData);

module.exports = router;
