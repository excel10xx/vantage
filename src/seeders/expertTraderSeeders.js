const mongoose = require('mongoose');
const ExpertTrader = require('../models/expertTraderModel');
require('dotenv').config() 

mongoose.connect(process.env.DATABASE_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const expertTraders = [
    { name: 'Trader A', rating: 4.5, totalProfit: 10, followersEquity: 100000 },
    { name: 'Trader B', rating: 4.7, totalProfit: 20, followersEquity: 150000 },
    { name: 'Trader C', rating: 4.3, totalProfit: 15, followersEquity: 120000 },
    { name: 'Trader D', rating: 4.6, totalProfit: 18, followersEquity: 130000 },
    { name: 'Trader E', rating: 4.8, totalProfit: 25, followersEquity: 200000 },
    { name: 'Trader F', rating: 4.2, totalProfit: 12, followersEquity: 110000 },
    { name: 'Trader G', rating: 4.9, totalProfit: 30, followersEquity: 250000 },
    { name: 'Trader H', rating: 4.4, totalProfit: 16, followersEquity: 140000 },
    { name: 'Trader I', rating: 4.1, totalProfit: 8, followersEquity: 90000 },
    { name: 'Trader J', rating: 4.0, totalProfit: 5, followersEquity: 70000 },
    { name: 'Trader K', rating: 4.3, totalProfit: 13, followersEquity: 115000 }
];

const seedDB = async () => {
    await ExpertTrader.deleteMany({});
    await ExpertTrader.insertMany(expertTraders);
    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB();

console.log("Expert Traders Seeded")