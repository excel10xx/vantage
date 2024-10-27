const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');
const sendEmail = require('../../utils/sendEmail');

const getCurrentAssetPrice = async (symbol) => {
    const asset = await Asset.findOne({ symbol });
    if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
    return asset.price;
};

// Controller to open a trade
const openTrade = async (req, res) => {
    const { userId, assetId, quantity, side } = req.body;
    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Fetch the current price of the asset
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Asset not found' });
        }

        // Assuming getCurrentAssetPrice is a function that fetches the live market price of the asset
        const currentPrice = await getCurrentAssetPrice(asset.symbol);
        if (!currentPrice) {
            return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Failed to fetch current asset price' });
        }

        // Check if the requested transfer amount (quantity) is less than or equal to the user's total balance
        if (quantity * currentPrice > user.totalBalance) {
            return res.status(400).json({ status: 'error', code: 400, data: null, message: 'Insufficient balance in your account.' });
        }

        // Create a new trade
        const trade = {
            asset: assetId,
            quantity: quantity,
            purchasePrice : currentPrice,
            side: side,
            status: 'opened',
            purchaseDate: new Date()
        };

        // Deduct the transfer quantity from the user's total balance
        user.totalBalance -= quantity * currentPrice;

        // Add the trade to the user's trades
        user.trades.push(trade);

        // Save changes to the user
        await user.save();

        // Send email notification to the user
        await sendEmail(user.email, 'Trade Opened', `You have successfully opened a trade for ${quantity} ${asset.symbol} at ${currentPrice} USD`);

        res.status(200).json({ status: 'success', code: 200, data: trade, message: 'Trade opened successfully' });
    } catch (error) {
        res.status(error.code || 400).json({ status: 'error', code: error.code || 400, data: null, message: error.message });
    }
};

// Controller to close a trade
const closeTrade = async (req, res) => {
    const { userId, tradeId } = req.body;

    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Find the trade to be closed
        const tradeIndex = user.trades.findIndex(trade => trade._id.equals(tradeId));
        if (tradeIndex === -1) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Trade not found' });
        }

        // Ensure the trade is open before attempting to close it
        const trade = user.trades[tradeIndex];
        if (trade.status !== 'opened') {
            return res.status(400).json({ status: 'error', code: 400, data: null, message: 'Trade is not open or has already been closed' });
        }

        // Fetch the current price of the asset
        const asset = await Asset.findById(trade.asset);
        if (!asset) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Asset not found' });
        }

        // Assuming getCurrentAssetPrice is a function that fetches the live market price of the asset
        const currentPrice = await getCurrentAssetPrice(asset.symbol);
        if (!currentPrice) {
            return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Failed to fetch current asset price' });
        }

        // Calculate the trade balance based on the current price of the asset
        const tradeBalance = trade.quantity * currentPrice;

        // Set the close date of the trade to the current date
        trade.closeDate = new Date();
        // Update the status of the trade to 'closed'
        trade.status = 'closed';

        // Add the trade balance back to the user's total balance
        user.totalBalance += tradeBalance;

        // Save changes to the user
        await user.save();

        // Send email notification to the user
        await sendEmail(user.email, 'Trade Closed', `You have successfully closed a trade for ${trade.quantity} ${asset.symbol} at the current market price of ${currentPrice}USD. Your account balance has been updated.`);

        res.status(200).json({ status: 'success', code: 200, data: trade, message: 'Trade closed successfully and balance updated.' });
    } catch (error) {
        console.error('Error closing trade:', error);
        res.status(error.code || 500).json({ status: 'error', code: error.code || 500, data: null, message: error.message });
    }
};

module.exports = { openTrade, closeTrade };
