const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getCryptoAccountDetails } = require('../controllers/account-details/accountDetailsController');

// Route to fetch cryptocurrency account details
router.get('/:cryptocurrency/:chain', authenticate, getCryptoAccountDetails);

module.exports = router;