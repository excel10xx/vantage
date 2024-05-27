const User = require('../../models/userModel');
const ExpertTrader = require('../../models/expertTraderModel');
const sendEmail = require('../../utils/sendEmail');

// Controller to follow a copy trader (create and open a copy trading portfolio)
const followCopyTrader = async (req, res) => {
    const { userId, traderId, allocatedAmount, initialEquity } = req.body;
    try {
        // Find the user and expert trader by their IDs
        const user = await User.findById(userId);
        const trader = await ExpertTrader.findById(traderId);
        if (!user || !trader) throw { status: 'error', code: 404, data: null, message: 'User or trader not found' };

        // Create a new copy trading portfolio
        const portfolio = {
            trader: traderId,
            allocatedAmount,
            initialEquity,
            commission: 0.0,
            status: 'active'
        };

        // Add the portfolio to the user's copy trading portfolios
        user.copyTradingPortfolio.push(portfolio);

        // Save changes to the user
        await user.save();

        // Send email notification to the user
        await sendEmail(user.email, 'Copy Trader Followed', `You have successfully followed ${trader.name}`);

        res.status(200).json({ status: 'success', code: 200, data: user, message: 'Copy trader followed successfully' });
    } catch (error) {
        res.status(error.code || 400).json({ status: error.status || 'error', code: error.code || 400, data: null, message: error.message });
    }
};

// Controller to stop following a copy trader (close a copy trading portfolio)
const stopFollowCopyTrader = async (req, res) => {
    const { userId, portfolioId } = req.body;
    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Find the copy trading portfolio to be closed
        const portfolioIndex = user.copyTradingPortfolio.findIndex(portfolio => portfolio._id.equals(portfolioId));
        if (portfolioIndex === -1) throw { status: 'error', code: 404, data: null, message: 'Portfolio not found' };

        // Set the closing date of the portfolio to the current date
        user.copyTradingPortfolio[portfolioIndex].closingDate = new Date();
        // Update the status of the portfolio to 'closed'
        user.copyTradingPortfolio[portfolioIndex].status = 'closed';

        // Save changes to the user
        await user.save();

        // Send email notification to the user
        await sendEmail(user.email, 'Copy Trader Unfollowed', `You have successfully stopped following the copy trader`);

        res.status(200).json({ status: 'success', code: 200, data: user, message: 'Copy trader unfollowed successfully' });
    } catch (error) {
        res.status(error.code || 400).json({ status: error.status || 'error', code: error.code || 400, data: null, message: error.message });
    }
};

module.exports = { followCopyTrader, stopFollowCopyTrader };
