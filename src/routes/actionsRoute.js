const express = require('express');
const router = express.Router();
const {
    withdrawFromWallet,
    exchangeCurrency,
    transferFunds,
    depositIntoWallet
} = require('../controllers/actions/walletActionsController');
const { followCopyTrader, stopFollowCopyTrader } = require('../controllers/actions/copyTraderActionsController');
const { openTrade, closeTrade } = require('../controllers/actions/tradeActionsController');


// Route for withdrawing from wallet
router.post('/wallet/withdraw', async (req, res) => {
    const { userId, currency, amountInUSD } = req.body;
    try {
        const user = await withdrawFromWallet(userId, currency, amountInUSD);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Route for exchanging currency
router.post('/wallet/exchange', async (req, res) => {
    const { userId, fromCurrency, toCurrency, amountInUSD } = req.body;
    try {
        const user = await exchangeCurrency(userId, fromCurrency, toCurrency, amountInUSD);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Route for transferring funds
router.post('/wallet/transfer', async (req, res) => {
    const { senderId, receiverId, currency, amountInUSD } = req.body;
    try {
        const result = await transferFunds(senderId, receiverId, currency, amountInUSD);
        res.status(200).json({ success: true, result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Route for depositing into wallet
router.post('/wallet/deposit', async (req, res) => {
    const { userId, currency, amountInUSD } = req.body;
    try {
        const user = await depositIntoWallet(userId, currency, amountInUSD);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});



// Route to follow a copy trader
router.post('copytrader/follow', async (req, res) => {
    try {
        await followCopyTrader(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to stop following a copy trader
router.post('copytrader/unfollow', async (req, res) => {
    try {
        await stopFollowCopyTrader(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to open a trade
router.post('/open', async (req, res) => {
    try {
        await openTrade(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to close a trade
router.post('/close', async (req, res) => {
    try {
        await closeTrade(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;


