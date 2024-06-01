const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');
const sendEmail = require('../../utils/sendEmail');

// Utility function to get the current price of a cryptocurrency
const getCryptoPrice = async (symbol) => {
    const asset = await Asset.findOne({ symbol, type: 'cryptocurrency' });
    if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
    return asset.price;
};

// Withdraw from wallet controller
const withdrawFromWallet = async (userId, currency, amountInUSD) => {
    try {
        // Ensure the withdrawal amount is at least $2000
        if (amountInUSD < 2000) throw new Error('Withdrawal amount must be at least $2000');

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Find the wallet with the specified currency
        const wallet = user.wallets.find(wallet => wallet.currency === currency);
        if (!wallet) throw { status: 'error', code: 404, data: null, message: 'Wallet not found' };

        // Get the current price of the cryptocurrency
        const cryptoPrice = await getCryptoPrice(currency);

        // Convert USD amount to cryptocurrency amount
        const amount = amountInUSD / cryptoPrice;

        // Check if the user has sufficient balance
        if (wallet.balance < amount) throw { status: 'error', code: 400, data: null, message: 'Insufficient balance' };

        // Update wallet balance
        wallet.balance -= amount;

        // Create transaction record
        user.transactions.push({
            type: 'withdraw',
            currency,
            amount,
            amountInUSD,
            date: new Date()
        });

        // Save changes
        await user.save();

        // Send email notification
        await sendEmail(user.email, 'Withdrawal Confirmation', `You have successfully withdrawn ${amount} ${currency} (worth $${amountInUSD})`);

        return { status: 'success', code: 200, data: user, message: 'Trade opened successfully' };
    } catch (error) {
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
    }
};

// Exchange currency controller
const exchangeCurrency = async (userId, fromCurrency, toCurrency, amount) => {
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Find the wallets with the specified currencies
        const fromWallet = user.wallets.find(wallet => wallet.currency === fromCurrency);
        const toWallet = user.wallets.find(wallet => wallet.currency === toCurrency);
        if (!fromWallet || !toWallet) throw { status: 'error', code: 404, data: null, message: 'Wallets not found' };

        // Get the current price of the source cryptocurrency
        const fromCryptoPrice = await getCryptoPrice(fromCurrency);

        // Check if the user has sufficient balance in the source wallet
        if (fromWallet.balance < amount) throw { status: 'error', code: 400, data: null, message: 'Insufficient balance' };

        // Get the current price of the target cryptocurrency
        const toCryptoPrice = await getCryptoPrice(toCurrency);

        // Convert source cryptocurrency amount to target cryptocurrency amount
        const toAmount = (amount * fromCryptoPrice) / toCryptoPrice;

        // Perform exchange
        fromWallet.balance -= amount;
        toWallet.balance += toAmount;

        // Create transaction records
        user.transactions.push({
            type: 'exchange',
            fromCurrency,
            toCurrency,
            amount: toAmount,
            amountInUSD: amount * fromCryptoPrice,
            date: new Date()
        });

        // Save changes
        await user.save();

        // Send email notification
        await sendEmail(user.email, 'Exchange Confirmation', `You have successfully exchanged ${amount} ${fromCurrency} (worth $${amount * fromCryptoPrice}) to ${toAmount} ${toCurrency}`);

        return { status: 'success', code: 200, data: user, message: 'Trade opened successfully' };
    } catch (error) {
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
    }
};

// Transfer funds controller
const transfer = async (req, res) => {
    const userId = req.user.id; // Get user ID from auth middleware
    const { assetId, quantity, purchasePrice, side } = req.body;

    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Find the asset by its ID
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Asset not found' });
        }

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
        await sendEmail(user.email, 'Trade Opened', `You have successfully opened a trade for ${quantity} ${asset.symbol} at ${purchasePrice} ${asset.priceCurrency}`);

        // Return success response
        res.status(200).json({ status: 'success', code: 200, data: user, message: 'Trade opened successfully' });
    } catch (error) {
        console.error('Error placing trade:', error);
        res.status(error.code || 500).json({ status: 'error', code: error.code || 500, data: null, message: error.message });
    }
};



// Deposit into wallet controller
const depositIntoWallet = async (userId, currency, amountInUSD) => {
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Find the wallet with the specified currency
        const wallet = user.wallets.find(wallet => wallet.currency === currency);
        if (!wallet) throw { status: 'error', code: 404, data: null, message: 'Wallet not found' };

        // Get the current price of the cryptocurrency
        const cryptoPrice = await getCryptoPrice(currency);

        // Convert USD amount to cryptocurrency amount
        const amount = amountInUSD / cryptoPrice;

        // Update wallet balance
        wallet.balance += amount;

        // Create transaction record
        user.transactions.push({
            type: 'deposit',
            currency,
            amount,
            amountInUSD,
            date: new Date()
        });

        // Save changes
        await user.save();

        // Send email notification
        await sendEmail(user.email, 'Deposit Confirmation', `You have successfully deposited ${amount} ${currency} (worth $${amountInUSD}) into your wallet`);

        return { status: 'success', code: 200, data: user, message: 'Deposit successful' };
    } catch (error) {
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
    }
};

module.exports = {
    withdrawFromWallet,
    exchangeCurrency,
    transfer,
    depositIntoWallet
};
