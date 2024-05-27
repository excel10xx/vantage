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
const exchangeCurrency = async (userId, fromCurrency, toCurrency, amountInUSD) => {
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

        // Convert USD amount to source cryptocurrency amount
        const amount = amountInUSD / fromCryptoPrice;

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
            amountInUSD,
            date: new Date()
        });

        // Save changes
        await user.save();

        // Send email notification
        await sendEmail(user.email, 'Exchange Confirmation', `You have successfully exchanged ${amount} ${fromCurrency} (worth $${amountInUSD}) to ${toAmount} ${toCurrency}`);

        return { status: 'success', code: 200, data: user, message: 'Trade opened successfully' };
    } catch (error) {
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
    }
};

// Transfer funds controller
const transferFunds = async (senderId, receiverId, currency, amountInUSD) => {
    try {
        // Find the sender and receiver users
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) throw { status: 'error', code: 404, data: null, message: 'Sender or receiver not found' };

        // Find the sender's wallet with the specified currency
        const senderWallet = sender.wallets.find(wallet => wallet.currency === currency);
        if (!senderWallet) throw { status: 'error', code: 404, data: null, message: 'Sender wallet not found' };

        // Get the current price of the cryptocurrency
        const cryptoPrice = await getCryptoPrice(currency);

        // Convert USD amount to cryptocurrency amount
        const amount = amountInUSD / cryptoPrice;

        // Check if the sender has sufficient balance
        if (senderWallet.balance < amount) throw { status: 'error', code: 400, data: null, message: 'Insufficient balance' };

        // Find the receiver's wallet with the specified currency
        const receiverWallet = receiver.wallets.find(wallet => wallet.currency === currency);
        if (!receiverWallet) throw { status: 'error', code: 404, data: null, message: 'Receiver wallet not found' };

        // Update sender's and receiver's wallet balances
        senderWallet.balance -= amount;
        receiverWallet.balance += amount;

        // Create transaction records for sender and receiver
        sender.transactions.push({
            type: 'transfer',
            currency,
            amount: -amount,
            amountInUSD,
            date: new Date(),
            recipient: receiver.email
        });
        receiver.transactions.push({
            type: 'transfer',
            currency,
            amount,
            amountInUSD,
            date: new Date(),
            sender: sender.email
        });

        // Save changes
        await sender.save();
        await receiver.save();

        // Send email notification to sender and receiver
        await sendEmail(sender.email, 'Transfer Confirmation', `You have successfully transferred ${amount} ${currency} (worth $${amountInUSD}) to ${receiver.email}`);
        await sendEmail(receiver.email, 'Incoming Transfer', `You have received ${amount} ${currency} (worth $${amountInUSD}) from ${sender.email}`);

        return { status: 'success', code: 200, data: { sender, receiver }, message: 'Funds transferred successfully' };
    } catch (error) {
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
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
    transferFunds,
    depositIntoWallet
};
