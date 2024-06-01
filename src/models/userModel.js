const mongoose = require('mongoose');

const assetHoldingSchema = new mongoose.Schema({
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now }
});

const tradeSchema = new mongoose.Schema({
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    status: { type: String, enum: ['opened', 'closed'], default: 'opened' },
    purchaseDate: { type: Date, default: Date.now },
    closeDate: { type: Date },
    side: { type: String, enum: ['buy', 'sell'], required: true },
    commission: { type: Number, default: 0.0 },
    stopLoss: { type: Number },
    takeProfit: { type: Number }
});

const walletSchema = new mongoose.Schema({
    currency: String,
    privateKey: String,
    address: String,
    chain: String,
    balance: { type: Number, default: 0.0 }
});

const loginHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    status: String,
    location: String,
    device: String,
    ipAddress: String
});

const copyTradingPortfolioSchema = new mongoose.Schema({
    trader: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpertTrader', required: true },
    allocatedAmount: { type: Number, required: true },
    allocationDate: { type: Date, default: Date.now },
    closingDate: { type: Date },
    initialEquity: { type: Number, required: true },
    settledEquity: { type: Number },
    commission: { type: Number, default: 0.0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' }
});

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['withdraw', 'exchange', 'transfer', 'deposit'], required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    amountInUSD: { type: Number, required: true },
    date: { type: Date, default: Date.now() },
    sender: { type: String }, // For transfer transactions
    recipient: { type: String } // For transfer transactions
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationCode: String,
    isAdmin: { type: Boolean, default: false },
    depositBalance: { type: Number, default: 0.0 },
    totalBalance: { type: Number, default: 0.0 },
    isCopyTrader: { type: String, enum: ['None', 'Pending', 'Yes'], default: 'None' },
    wallets: [walletSchema],
    assetHoldings: [assetHoldingSchema],
    trades: [tradeSchema],
    loginHistory: [loginHistorySchema],
    followedTraders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExpertTrader' }],
    copyTradingPortfolio: [copyTradingPortfolioSchema],
    transactions: [transactionSchema],
    name: { type: String, required: true },
    profilePicture: { type: String, default: 'public/profile-pictures/defaultpicture.jpg' },
    googleId: { type: String, unique: true, sparse: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
