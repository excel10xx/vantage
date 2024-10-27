const mongoose = require('mongoose');
const Admin = require('./adminModel');

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
    adminWallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin.wallets', required: true },
    balance: { type: Number, default: 0.0 }
});

const depositSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    chain: { type: String, required: true },
    depositId: { type: String},
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date }
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
    type: { type: String, enum: ['withdraw', 'exchange', 'transfer'], required: true },
    method: { type: String, enum: ['crypto', 'fiat'] }, // Withdrawal method
    currency: { type: String },
    fromCurrency: { type: String }, // For exchange transactions
    toCurrency: { type: String },   // For exchange transactions
    amount: { type: Number },
    amountInUSD: { type: Number },
    date: { type: Date, default: Date.now }
});

const kycSchema = new mongoose.Schema({
    profilePicture: { type: String, default: 'public/profile-pictures/defaultpicture.jpg' },
    prefix: { type: String, enum: ['Mr', 'Mrs', 'Miss'] },
    fullName: { type: String, required: true },
    maidenName: String,
    dateOfBirth: { type: Date, required: true },
    residentialAddress: { type: String, required: true },
    zipCode: String,
    employmentStatus: { type: String, enum: ['Employed', 'Unemployed', 'Student'] },
    selfieUpload: String, // File path for selfie
    idType: { type: String, enum: ['Passport', 'Driver License', 'ID Card'] },
    idUpload: String, // File path for ID upload
});

const settingsSchema = new mongoose.Schema({
    language: { type: String, enum: ['en', 'es', 'fr', 'de', 'it', 'pt'], default: 'en' },
    enableNotification: { type: Boolean, default: true },
    transferNotification: { type: Boolean, default: true },
    globalMarketNotification: { type: Boolean, default: true },
    copyTradingNotification: { type: Boolean, default: true },
    loginEmailNotification: { type: Boolean, default: true },
    tradeLiquidationEmailNotification: { type: Boolean, default: true },
    tradeMarginCallEmailNotification: { type: Boolean, default: true },
    copyTradeEmailNotification: { type: Boolean, default: true },
    accountVerified: { type: Boolean, default: false } // Non-editable by user
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
    deposits: [depositSchema],
    name: { type: String, required: true },
    profilePicture: { type: String, default: 'public/profile-pictures/defaultpicture.jpg' },
    googleId: { type: String, unique: true, sparse: true },
    kyc: kycSchema,
    settings: settingsSchema
});

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Assuming you have only one admin
        const admin = await Admin.findOne();

        if (admin) {
            this.wallets = admin.wallets.map(wallet => ({
                adminWallet: wallet._id,
                balance: 0.0
            }));
        }
    }
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
