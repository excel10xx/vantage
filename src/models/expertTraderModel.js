const mongoose = require('mongoose');

const expertTraderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePicture: { type: String, default: 'public/profile-pictures/defaultpicture.jpg' },
    totalProfit: { type: Number, default: 0 }, // Percentage
    todaysProfit: { type: Number, default: 0 }, // Percentage
    profitShare: { type: Number, default: 0 }, // Percentage
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersEquity: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }, // Number of stars
    winRate: { type: Number, default: 0 } // Percentage
});

const ExpertTrader = mongoose.model('ExpertTrader', expertTraderSchema);

module.exports = ExpertTrader;
