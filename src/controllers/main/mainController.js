const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');
const ExpertTrader = require('../../models/expertTraderModel');

async function getAllUserDetails(req, res) {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId)
            .populate('assetHoldings.asset')
            .populate('trades.asset')
            .populate('copyTradingPortfolio.trader');

        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Calculate profit balance
        let profitBalance = 0;
        for (const holding of user.assetHoldings) {
            const asset = holding.asset;
            const trade = user.trades.find(trade => trade.asset._id.toString() === asset._id.toString() && trade.status === 'closed');
            if (trade) {
                const profit = (asset.price - trade.purchasePrice) * trade.quantity;
                profitBalance += profit;
            }
        }

        // Calculate total balance
        const totalBalance = user.depositBalance + profitBalance;

        // Arrays to hold wallet balances and total equity
        const walletBalances = [];
        let totalWalletEquityUSD = 0;

        // Fetch cryptocurrency prices from the Asset model
        const cryptoAssets = await Asset.find({ type: 'cryptocurrency' });

        // Calculate and format balances for each wallet
        for (const wallet of user.wallets) {
            // Exclude the privateKey field
            const { privateKey, ...walletWithoutPrivateKey } = wallet.toObject();

            // Find the asset with the same symbol as the wallet's currency
            const asset = cryptoAssets.find(asset => asset.symbol === wallet.currency);
            if (!asset) {
                return res.status(400).json({ status: 'error', code: 400, data: null, message: `No price found for ${wallet.currency}` });
            }

            // Calculate amount in USD
            const amountUSD = wallet.balance * asset.price;
            totalWalletEquityUSD += amountUSD;

            // Add wallet balance to the array
            walletBalances.push({
                wallet: walletWithoutPrivateKey,
                amountInCoin: wallet.balance,
                amountInUSD: amountUSD,
                pending: wallet.pending
            });
        }

        // Arrays to hold asset holdings details and total equity
        const assetHoldingsDetails = [];
        let totalAssetHoldingsEquityUSD = 0;

        // Loop through each asset holding of the user
        for (const holding of user.assetHoldings) {
            const asset = holding.asset;

            // Calculate current equity in asset and in USD
            const currentPrice = asset.price;
            const equityInAsset = holding.quantity;
            const equityInUSD = holding.quantity * currentPrice;
            totalAssetHoldingsEquityUSD += equityInUSD;

            // Calculate open P/L in asset and in USD
            const openPLInAsset = holding.quantity * (currentPrice - holding.purchasePrice);
            const openPLInUSD = holding.quantity * currentPrice - holding.quantity * holding.purchasePrice;

            // Add holding details to the array
            assetHoldingsDetails.push({
                asset: asset.name,
                symbol: asset.symbol,
                quantity: holding.quantity,
                purchasePrice: holding.purchasePrice,
                currentPrice: currentPrice,
                equityInAsset: equityInAsset,
                equityInUSD: equityInUSD,
                openPLInAsset: openPLInAsset,
                openPLInUSD: openPLInUSD
            });
        }

        // Arrays to hold cryptocurrency holdings details and total equity
        const cryptoHoldingsDetails = [];
        let totalCryptoHoldingsEquityUSD = 0;

        // Loop through each cryptocurrency holding of the user
        for (const holding of user.assetHoldings) {
            const asset = holding.asset;
            if (asset.type !== 'cryptocurrency') {
                continue;
            }

            // Calculate current equity in asset and in USD
            const currentPrice = asset.price;
            const equityInAsset = holding.quantity;
            const equityInUSD = holding.quantity * currentPrice;
            totalCryptoHoldingsEquityUSD += equityInUSD;

            // Calculate open P/L in asset and in USD
            const openPLInAsset = holding.quantity * (currentPrice - holding.purchasePrice);
            const openPLInUSD = holding.quantity * currentPrice - holding.quantity * holding.purchasePrice;

            // Add holding details to the array
            cryptoHoldingsDetails.push({
                asset: asset.name,
                symbol: asset.symbol,
                quantity: holding.quantity,
                purchasePrice: holding.purchasePrice,
                currentPrice: currentPrice,
                equityInAsset: equityInAsset,
                equityInUSD: equityInUSD,
                openPLInAsset: openPLInAsset,
                openPLInUSD: openPLInUSD
            });
        }

        // Get random copy traders
        const count = await ExpertTrader.countDocuments();
        const random = count > 10 ? Math.floor(Math.random() * (count - 10)) : 0;
        const copyTraders = await ExpertTrader.find().skip(random).limit(Math.min(count, 10));

        // Get the copy trading portfolio of the user
        const copyTradingPortfolio = user.copyTradingPortfolio.map(portfolio => ({
            trader: portfolio.trader.name,
            allocatedAmount: portfolio.allocatedAmount,
            allocationDate: portfolio.allocationDate
        }));

        return res.status(200).json({
            status: 'success',
            code: 200,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                depositBalance: user.depositBalance,
                profitBalance,
                totalBalance,
                walletBalances,
                assetHoldingsDetails,
                cryptoHoldingsDetails,
                copyTraders,
                copyTradingPortfolio,
                totalEquity: {
                    wallets: totalWalletEquityUSD,
                    assetHoldings: totalAssetHoldingsEquityUSD,
                    cryptoHoldings: totalCryptoHoldingsEquityUSD
                }
            },
            message: 'User details retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    getAllUserDetails
};
