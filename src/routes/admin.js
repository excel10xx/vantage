const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/protect');
const { loginAdmin } = require('../controllers/admin/login');
const { createWallet, getAllWallets, updateWallet, deleteWallet } = require('../controllers/admin/coins');
const { getAllUsers, getUserById, updateUserName, updateUserEmail, updateUserProfilePicture, updateUserGoogleId } = require('../controllers/admin/users/userProfileController');
const { deleteAllUserTrades, createTrade, getUserTradeHistory, getUserTransactions, updateUserBalance, updateDepositTransaction, updateWithdrawalTransaction, updateTradeHistory, updateCopyTradingPortfolio } = require('../controllers/admin/users/financialTradeController');
const { createExpertTrader, getAllExpertTraders, getExpertTraderById, updateExpertTrader, deleteExpertTrader } = require('../controllers/admin/expertTrader');
const { createArticle, updateArticle, deleteArticle, createCourse, updateCourse, deleteCourse, createPromoCode, updatePromoCode, deletePromoCode, } = require('../controllers/admin/content');


// Login Route
router.post('/login', loginAdmin);

// Coins Route
router.post('/wallets', protect, createWallet);
router.get('/wallets', protect, getAllWallets);
router.put('/wallets/:id', protect, updateWallet);
router.delete('/wallets/:id', protect, deleteWallet);

//Users Route-----------------------------------------------------------------------------------------------------------------------------------------

router.get('/users', protect, getAllUsers);
router.get('/users/:userId', protect, getUserById);

// User Profile Management Routes
router.put('/users/:userId/name', protect, updateUserName);
router.put('/users/:userId/email', protect, updateUserEmail);
router.put('/users/:userId/profile-picture', protect, updateUserProfilePicture);
router.put('/users/:userId/google-id', protect, updateUserGoogleId);

// Finanicial Trade Routes
router.post('/trades', protect, createTrade);
router.get('/trades', protect, getUserTradeHistory);
router.delete('/trades', protect, deleteAllUserTrades);
router.get('/transactions', protect, getUserTransactions);
router.put('/balance/:userId', protect, updateUserBalance);
router.put('/deposits/:userId/:depositId', protect, updateDepositTransaction);
router.put('/withdrawals/:userId/:transactionId', protect, updateWithdrawalTransaction);
router.put('/trades/:userId/:tradeId', protect, updateTradeHistory);
router.put('/copy-trading/:userId/:portfolioId', protect, updateCopyTradingPortfolio);

//------------------------------------------------------------------------------------------------------------------------------------------------------

// Expert Trader Routes
router.post('/expert-traders', protect, createExpertTrader);
router.get('/expert-traders', protect, getAllExpertTraders);
router.get('/expert-traders/:id', protect, getExpertTraderById);
router.put('/expert-traders/:id', protect, updateExpertTrader);
router.delete('/expert-traders/:id', protect, deleteExpertTrader);

// Article Routes for Admin
router.post('/articles', protect, createArticle);
router.put('/articles/:id', protect, updateArticle);
router.delete('/articles/:id', protect, deleteArticle);

// Course Routes for Admin
router.post('/courses', protect, createCourse);
router.put('/courses/:id', protect, updateCourse);
router.delete('/courses/:id', protect, deleteCourse);

// Promo Code Routes for Admin
router.post('/promocodes', protect, createPromoCode);
router.put('/promocodes/:id', protect, updatePromoCode);
router.delete('/promocodes/:id', protect, deletePromoCode);


module.exports = router;
