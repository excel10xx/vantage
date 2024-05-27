const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');

async function getUserTrades(req, res) {
    const userId = req.user.id;

    try {
        // Find the user by ID and populate the trades with asset details
        const user = await User.findById(userId).populate('trades.asset');
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Fetch current prices for assets
        const assetIds = user.trades.map(trade => trade.asset._id);
        const assets = await Asset.find({ _id: { $in: assetIds } });
        const assetPriceMap = assets.reduce((map, asset) => {
            map[asset._id] = asset.price;
            return map;
        }, {});

        // Sort trades by date/time
        const sortedTrades = user.trades.sort((a, b) => b.purchaseDate - a.purchaseDate);

        // Map trades to the required format and calculate values
        const tradesDetails = sortedTrades.map(trade => {
            const currentPrice = assetPriceMap[trade.asset._id];
            const settledPL = (currentPrice - trade.purchasePrice) * trade.quantity;
            const roi = (settledPL / (trade.purchasePrice * trade.quantity)) * 100;
            const commission = trade.commission; // If commission logic needs to be added, do it here

            return {
                symbol: trade.asset.symbol,
                side: trade.side,
                amount: trade.quantity,
                price: trade.purchasePrice,
                settledPL: trade.status === 'closed' ? settledPL : null,
                roi: trade.status === 'closed' ? roi : null,
                commission: commission,
                orderID: trade._id.toString(), // Use _id as orderID
                date: trade.purchaseDate,
            };
        });

        // Response with the user's trades
        return res.status(200).json({ status: 'success', code: 200, data: tradesDetails, message: 'Trades retrieved successfully' });
    } catch (error) {
        console.error('Error fetching user trades:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    getUserTrades
};
