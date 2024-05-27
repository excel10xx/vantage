const mongoose = require('mongoose');
const Asset = require('../models/assetsModel'); 
require('dotenv').config()

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URI, {
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

(async () => await connectDB())();

const cryptocurrencies = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'cryptocurrency', price: 0 },
    { symbol: 'ETH', name: 'Ethereum', type: 'cryptocurrency', price: 0 },
    { symbol: 'USDT', name: 'Tether', type: 'cryptocurrency', price: 0 },
    { symbol: 'USDC', name: 'USD Coin', type: 'cryptocurrency', price: 0 },
    { symbol: 'BNB', name: 'Binance Cash', type: 'cryptocurrency', price: 0 },
    { symbol: 'BUSD', name: 'Binance Coin USD', type: 'cryptocurrency', price: 0 },
    { symbol: 'XRP', name: 'Ripple', type: 'cryptocurrency', price: 0 },
    { symbol: 'ADA', name: 'Cardano', type: 'cryptocurrency', price: 0 },
    { symbol: 'SOL', name: 'Solana', type: 'cryptocurrency', price: 0 },
    { symbol: 'DOGE', name: 'Dogecoin', type: 'cryptocurrency', price: 0 },
    { symbol: 'DOT', name: 'Polkadot', type: 'cryptocurrency', price: 0 },
    { symbol: 'DAI', name: 'Dai', type: 'cryptocurrency', price: 0 },
    { symbol: 'MATIC', name: 'Polygon', type: 'cryptocurrency', price: 0 },
    { symbol: 'SHIB', name: 'Shiba Inu', type: 'cryptocurrency', price: 0 },
    { symbol: 'TRX', name: 'TRON', type: 'cryptocurrency', price: 0 },
    { symbol: 'AVAX', name: 'Avalanche', type: 'cryptocurrency', price: 0 },
    { symbol: 'LEO', name: 'UNUS SED LEO', type: 'cryptocurrency', price: 0 },
    { symbol: 'LTC', name: 'Litecoin', type: 'cryptocurrency', price: 0 },
    { symbol: 'XLM', name: 'Stellar', type: 'cryptocurrency', price: 0 },
    { symbol: 'BCH', name: 'Bitcoin Cash', type: 'cryptocurrency', price: 0 }
];

const stocks = [
    { symbol: 'AAPL', name: 'Apple', type: 'stock', price: 0 },
    { symbol: 'MSFT', name: 'Microsoft', type: 'stock', price: 0 },
    { symbol: 'AMZN', name: 'Amazon', type: 'stock', price: 0 },
    { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', price: 0 },
    { symbol: 'GOOGL', name: 'Alphabet', type: 'stock', price: 0 },
    { symbol: 'TSLA', name: 'Tesla', type: 'stock', price: 0 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', type: 'stock', price: 0 },
    { symbol: 'META', name: 'Meta', type: 'stock', price: 0 },
    { symbol: 'UNH', name: 'UnitedHealth Group', type: 'stock', price: 0 },
    { symbol: 'XOM', name: 'Exxon Mobil', type: 'stock', price: 0 },
    { symbol: 'LLY', name: 'Eli Lilly', type: 'stock', price: 0 },
    { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stock', price: 0 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', price: 0 },
    { symbol: 'V', name: 'Visa', type: 'stock', price: 0 },
    { symbol: 'PG', name: 'Procter & Gamble', type: 'stock', price: 0 },
    { symbol: 'MA', name: 'Mastercard', type: 'stock', price: 0 },
    { symbol: 'AVGO', name: 'Broadcom', type: 'stock', price: 0 },
    { symbol: 'HD', name: 'Home Depot', type: 'stock', price: 0 },
    { symbol: 'CVX', name: 'Chevron Corporation', type: 'stock', price: 0 },
    { symbol: 'MRK', name: 'Merck', type: 'stock', price: 0 },
    { symbol: 'ABBV', name: 'AbbVie', type: 'stock', price: 0 },
    { symbol: 'COST', name: 'Costco', type: 'stock', price: 0 },
    { symbol: 'PEP', name: 'PepsiCo', type: 'stock', price: 0 },
    { symbol: 'ADBE', name: 'Adobe', type: 'stock', price: 0 },
    { symbol: 'ASML', name: 'ASML', type: 'stock', price: 0 },
    { symbol: 'PRX.AS', name: 'Prosus', type: 'stock', price: 0 },
    { symbol: 'AIR.PA', name: 'Airbus', type: 'stock', price: 0 },
    { symbol: 'NXPI', name: 'NXP Semiconductors', type: 'stock', price: 0 },
    { symbol: 'STLA', name: 'Stellantis', type: 'stock', price: 0 },
    { symbol: 'UMG.AS', name: 'Universal Music Group', type: 'stock', price: 0 },
    { symbol: 'ING', name: 'ING', type: 'stock', price: 0 },
    { symbol: 'HEIA.AS', name: 'Heineken', type: 'stock', price: 0 },
    { symbol: 'ADYEN.AS', name: 'Adyen', type: 'stock', price: 0 },
    { symbol: 'WKL.AS', name: 'Wolters Kluwer', type: 'stock', price: 0 }
];

// Function to seed the database with cryptocurrencies
async function seedCryptocurrencies() {
    try {
        // Clear existing data
        await Asset.deleteMany({ type: 'cryptocurrency' });

        // Insert new data
        const createdCryptocurrencies = await Asset.create(cryptocurrencies);
        console.log('Cryptocurrencies seeded successfully:', createdCryptocurrencies);
    } catch (err) {
        console.error('Error seeding cryptocurrencies:', err);
     } // finally {
    //     // Close the connection
    //     mongoose.disconnect();
    // }
}

(async () => await connectDB())();

async function seedStocks() {
    try {
        // Clear existing data
        await Asset.deleteMany({ type: 'stock' });

        // Insert new data
        const createdStocks = await Asset.create(stocks);
        console.log('Stocks seeded successfully:', createdStocks);
    } catch (err) {
        console.error('Error seeding stocks:', err);
    } finally {
        // Close the connection
        mongoose.disconnect();
    }
}

// Call the seeding function
(async () => await seedCryptocurrencies())();
(async () => await seedStocks())();

