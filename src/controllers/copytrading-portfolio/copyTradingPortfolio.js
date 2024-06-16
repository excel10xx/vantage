const User = require('../../models/userModel');


async function getUserCopyTradingData(req, res) {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate({
            path: 'copyTradingPortfolio.trader',
            model: 'ExpertTrader'
        });

        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Generate a random multiplier between 1.5 and 3
        const randomMultiplier = 1.5 + Math.random() * 1.5;

        // Copy trading portfolio
        const portfolio = user.copyTradingPortfolio
            .filter(portfolioItem => portfolioItem.status === 'active')
            .map(portfolioItem => {
            const id = portfolioItem._id;
            const trader = portfolioItem.trader;
            const todaysProfit = trader.todaysProfit
            const initialEquity = portfolioItem.initialEquity;
            const currentEquity = portfolioItem.initialEquity * randomMultiplier;
            const sl = 1; // Placeholder for S/L calculation
            const totalProfit = trader.totalProfit;
            const status = portfolioItem.status;

            return {
                id: id,
                name: trader.name,
                todaysProfit: todaysProfit.toFixed(2),
                totalProfit: totalProfit,
                sl: sl,
                initialEquity: initialEquity.toFixed(2),
                currentEquity: currentEquity.toFixed(2),
                status: status
            };
        });

        

        // Following history
        const followingHistory = user.copyTradingPortfolio
            .filter(portfolioItem => portfolioItem.status === 'closed')
            .map(portfolioItem => {
                const id = portfolioItem._id;
                const trader = portfolioItem.trader;
                const initialEquity = portfolioItem.initialEquity;
                const settledEquity = portfolioItem.settledEquity;
                const commission = portfolioItem.commission;
                const totalProfit = trader.totalProfit;
                const openingDate = portfolioItem.allocationDate;
                const closingDate = portfolioItem.closingDate;

                return {
                    id: id,
                    name: trader.name,
                    totalProfit: totalProfit.toFixed(2),
                    openingDate: openingDate.toISOString().split('T')[0],
                    closingDate: closingDate.toISOString().split('T')[0],
                    initialEquity: initialEquity.toFixed(2),
                    settledEquity: settledEquity.toFixed(2),
                    commission: commission.toFixed(2)
                };
            });

        return res.status(200).json({
            status: 'success',
            code: 200,
            data: { portfolio, followingHistory },
            message: 'Copy trading data retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching copy trading data:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    getUserCopyTradingData
};
