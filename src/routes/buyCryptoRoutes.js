const express = require('express');
const authenticate = require('../middleware/authenticate');
const router = express.Router();
const { getWalletDetails } = require('../controllers/buy-crypto/walletDetailsController');


router.get('/:currency/:chain', authenticate, getWalletDetails);

module.exports = router;