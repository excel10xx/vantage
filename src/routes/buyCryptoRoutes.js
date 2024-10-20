const express = require('express');
const authenticate = require('../middleware/authenticate');
const router = express.Router();
const { getWalletDetails, getCoinsAndChains } = require('../controllers/buy-crypto/walletDetailsController');


router.get('/:currency/:chain', authenticate, getWalletDetails);

// Route to get all coins and chains, or specific chains for a given coin
router.get('/chain', authenticate, getCoinsAndChains);


module.exports = router;