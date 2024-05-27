const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');

// Controller to open a trade
const openTrade = async (req, res) => {
    const { userId, assetId, quantity, purchasePrice, side } = req.body;
    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Create a new trade
        const trade = {
            asset: assetId,
            quantity,
            purchasePrice,
            side,
            status: 'opened',
            purchaseDate: new Date()
        };

        // Add the trade to the user's trades
        user.trades.push(trade);

        // Save changes to the user
        await user.save();

        // Send email notification to the user
        await sendEmail(user.email, 'Trade Opened', `You have successfully opened a trade`);

        res.status(200).json({ status: 'success', code: 200, data: user, message: 'Trade opened successfully' });
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
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Find the trade to be closed
        const tradeIndex = user.trades.findIndex(trade => trade._id.equals(tradeId));
        if (tradeIndex === -1) throw { status: 'error', code: 404, data: null, message: 'Trade not found' };

        // Set the close date of the trade to the current date
        user.trades[tradeIndex].closeDate = new Date();
        // Update the status of the trade to 'closed'
        user.trades[tradeIndex].status = 'closed';

        // Save changes to the user
        await user.save();

        // Send email notification to the user
        await sendEmail(user.email, 'Trade Closed', `You have successfully closed a trade`);

        res.status(200).json({ status: 'success', code: 200, data: user, message: 'Trade closed successfully' });
    } catch (error) {
        res.status(error.code || 400).json({ status: 'error', code: error.code || 400, data: null, message: error.message });
    }
};

module.exports = { openTrade, closeTrade };
