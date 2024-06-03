const express = require('express');
const { getCopyTradingExperts } = require('../controllers/copytrading-rating/copyTradingRating');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, getCopyTradingExperts);

module.exports = router;
