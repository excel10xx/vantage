const mongoose = require('mongoose');
const ExpertTrader = require('../models/expertTraderModel');
require('dotenv').config() 

mongoose.connect(process.env.DATABASE_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const expertTraders = [
    { name: 'Trader A', rating: 4.5, totalProfit: 10, todaysProfit: 0.5, profitShare: 20, followers: [], followersEquity: 100000, winRate: 70 },
    { name: 'Trader B', rating: 4.7, totalProfit: 20, todaysProfit: 1.0, profitShare: 25, followers: [], followersEquity: 150000, winRate: 75 },
    { name: 'Trader C', rating: 4.3, totalProfit: 15, todaysProfit: 0.8, profitShare: 22, followers: [], followersEquity: 120000, winRate: 72 },
    { name: 'Trader D', rating: 4.6, totalProfit: 18, todaysProfit: 0.9, profitShare: 23, followers: [], followersEquity: 130000, winRate: 74 },
    { name: 'Trader E', rating: 4.8, totalProfit: 25, todaysProfit: 1.2, profitShare: 30, followers: [], followersEquity: 200000, winRate: 78 },
    { name: 'Trader F', rating: 4.2, totalProfit: 12, todaysProfit: 0.6, profitShare: 18, followers: [], followersEquity: 110000, winRate: 69 },
    { name: 'Trader G', rating: 4.9, totalProfit: 30, todaysProfit: 1.5, profitShare: 35, followers: [], followersEquity: 250000, winRate: 80 },
    { name: 'Trader H', rating: 4.4, totalProfit: 16, todaysProfit: 0.7, profitShare: 20, followers: [], followersEquity: 140000, winRate: 71 },
    { name: 'Trader I', rating: 4.1, totalProfit: 8, todaysProfit: 0.4, profitShare: 15, followers: [], followersEquity: 90000, winRate: 65 },
    { name: 'Trader J', rating: 4.0, totalProfit: 5, todaysProfit: 0.2, profitShare: 10, followers: [], followersEquity: 70000, winRate: 60 },
    { name: 'Trader K', rating: 4.3, totalProfit: 13, todaysProfit: 0.5, profitShare: 19, followers: [], followersEquity: 115000, winRate: 68 }
];

const seedDB = async () => {
    await ExpertTrader.deleteMany({});
    await ExpertTrader.insertMany(expertTraders);
    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB();

console.log("Expert Traders Seeded")