const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');

async function getMarketData(req, res) {
    const userId = req.user.id;
    const { marketType } = req.params; // Expecting 'Global-Markets-USDT', 'Crypto-Futures-USDT', 'Global-Markets-BTC', or 'Crypto-Futures-BTC'

    // Determine the asset class and conversion currency based on the input
    let assetClass, conversionCurrency;
    if (marketType.startsWith('global-markets')) {
        assetClass = 'stock';
    } else if (marketType.startsWith('crypto-futures')) {
        assetClass = 'cryptocurrency';
    } else {
        return res.status(400).json({ status: 'error', code: 400, data: null, message: 'Invalid market type' });
    }
    conversionCurrency = marketType.endsWith('usdt') ? 'USDT' : 'BTC';

    try {
        // Fetch the user by ID and populate relevant data
        const user = await User.findById(userId).populate('trades.asset').populate('wallets');
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Fetch the conversion asset price
        const conversionAsset = await Asset.findOne({ symbol: conversionCurrency });
        if (!conversionAsset) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: `${conversionCurrency} asset not found` });
        }
        const conversionPrice = conversionAsset.price;

        // Initialize variables to store data
        let walletBalances = [];
        let assetPrices = [];
        let orders = [];
        let positions = [];

        // Process data for wallets
        const wallet = user.wallets.find(wallet => wallet.currency === conversionCurrency.toUpperCase());
        if (!wallet) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: `Wallet for ${conversionCurrency} not found` });
        }

        let balanceInConversionCurrency = wallet.balance;
        const accountMargin = balanceInConversionCurrency * conversionPrice;
        const equity = accountMargin; // Assuming equity is the same as account margin for simplicity
        const unrealizedPL = (conversionPrice - wallet.purchasePrice) * wallet.balance; // Placeholder logic
        const usedMargin = accountMargin * 0.25; // Example: 25% of account margin is used
        const availableMargin = accountMargin - usedMargin;
        const bonus = 0; // Placeholder for bonus, modify as per your bonus logic

        walletBalances.push({
            symbol: conversionCurrency.toUpperCase(),
            balance: balanceInConversionCurrency,
            accountMargin: accountMargin,
            equity: equity,
            unrealizedPL: unrealizedPL,
            usedMargin: usedMargin,
            availableMargin: availableMargin,
            bonus: bonus
        });

        // Fetch the assets of the specified class
        const assets = await Asset.find({ type: assetClass });
        if (!assets) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: `${assetClass} assets not found` });
        }

        // Map assets to the required format and convert prices
        assetPrices = assets.map(asset => {
            let priceInConversionCurrency = asset.price;

            if (asset.priceCurrency !== conversionCurrency) {
                priceInConversionCurrency = asset.price / conversionPrice;
            }

            // Calculate bid and ask prices
            const bidPrice = priceInConversionCurrency * (1 - Math.random() * 0.01); // Bid price slightly less than the market price
            const askPrice = priceInConversionCurrency * (1 + Math.random() * 0.01); // Ask price slightly higher than the market price

            return {
                symbol: asset.symbol,
                name: asset.name,
                price: priceInConversionCurrency,
                bidPrice: bidPrice,
                askPrice: askPrice,
                baseCurrency: conversionCurrency
            };
        });

        // Filter and map trades to the required format, converting prices as necessary
        orders = user.trades
            .filter(trade => trade.asset.type === assetClass)
            .map(trade => {
                let priceInConversionCurrency = trade.purchasePrice;

                if (trade.asset.priceCurrency !== conversionCurrency) {
                    priceInConversionCurrency = trade.purchasePrice / conversionPrice;
                }

                return {
                    symbol: trade.asset.symbol,
                    side: trade.side,
                    size: trade.quantity,
                    price: priceInConversionCurrency,
                    commission: trade.commission
                };
            });

        // Map trades to the required format, calculating current price, P/L, and take profit
        positions = user.trades
            .filter(trade => trade.asset.type === assetClass && trade.status === 'opened')
            .map(trade => {
                const currentPrice = trade.asset.price / conversionPrice;
                const fillPrice = trade.purchasePrice / conversionPrice;
                const PL = (currentPrice - fillPrice) * trade.quantity * (trade.side === 'buy' ? 1 : -1);
                const takeProfit = trade.side === 'buy' ? currentPrice >= (fillPrice * 1.05) : currentPrice <= (fillPrice * 0.95); // Example take profit condition (5% gain/loss)

                return {
                    symbol: trade.asset.symbol,
                    side: trade.side,
                    size: trade.quantity,
                    fillPrice: fillPrice,
                    currentPrice: currentPrice,
                    PL: PL,
                    takeProfit: takeProfit
                };
            });

        // Return the market data
        return res.status(200).json({
            status: 'success',
            code: 200,
            data: { walletBalances, assetPrices, orders, positions },
            message: 'Market data retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching market data:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    getMarketData
};
