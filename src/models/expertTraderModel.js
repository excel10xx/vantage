const mongoose = require('mongoose');

const expertTraderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePicture: { type: String, default: 'public/profile-pictures/defaultpicture.jpg' },
    totalProfit: { type: Number, default: 500 }, // Percentage
    todaysProfit: { type: Number, default: 7 }, // Percentage
    profitShare: { type: Number, default: 50 }, // Percentage
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersEquity: { type: Number, default: 25000000 },
    minimumCapital: { type: Number, default: 1000 },
    rating: { type: Number, default: 4 }, // Number of stars
    winRate: { type: Number, default: 81 } // Percentage
});

const ExpertTrader = mongoose.model('ExpertTrader', expertTraderSchema);

module.exports = ExpertTrader;
