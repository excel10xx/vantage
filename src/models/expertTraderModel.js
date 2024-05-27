const mongoose = require('mongoose');

const expertTraderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 }, // Percentage
    followersEquity: { type: Number, default: 0 }
});

const ExpertTrader = mongoose.model('ExpertTrader', expertTraderSchema);

module.exports = ExpertTrader;
