const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');
const Admin = require('../../models/adminModel');
const sendEmail = require('../../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');

// Utility function to get the current price of a cryptocurrency
const getCryptoPrice = async (symbol) => {
    const asset = await Asset.findOne({ symbol, type: 'cryptocurrency' });
    if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
    return asset.price;
};

const getCurrentAssetPrice = async (symbol) => {
    const asset = await Asset.findOne({ symbol });
    if (!asset) throw new Error(`Asset with symbol ${symbol} not found`);
    return asset.price;
};

const withdrawFromWallet = async (userId, currency, chain, amountInUSD, method) => {
    try {
        currency = currency.toUpperCase();
        chain = chain.toUpperCase();

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            throw { status: 'error', code: 404, data: null, message: 'User not found' };
        }

        // Find the admin wallet with the specified currency and chain
        const admin = await Admin.findOne({ 'wallets.coin': currency, 'wallets.chainType': chain });
        if (!admin) {
            console.log('Admin wallet reference not found for the specified currency and chain');
            throw { status: 'error', code: 404, data: null, message: 'Admin reference wallet not found' };
        }

        const adminWallet = admin.wallets.find(wallet =>
            wallet.coin.toUpperCase() === currency && wallet.chainType.toUpperCase() === chain
        );

        if (!adminWallet) {
            console.log('Admin wallet not found for the specified currency and chain');
            throw { status: 'error', code: 404, data: null, message: 'Admin wallet not found' };
        }

        // Find the user's wallet that references the admin wallet
        const userWallet = user.wallets.find(wallet =>
            wallet.adminWallet.toString() === adminWallet._id.toString()
        );

        if (!userWallet) {
            console.log('User wallet not found for the specified admin wallet');
            throw { status: 'error', code: 404, data: null, message: 'User wallet not found' };
        }

        // Get the current price of the cryptocurrency
        const cryptoPrice = await getCryptoPrice(currency);

        // Convert USD amount to cryptocurrency amount
        const amount = amountInUSD / cryptoPrice;

        // Check if the user has sufficient balance
        if (userWallet.balance < amount) {
            console.log('Insufficient balance');
            throw { status: 'error', code: 400, data: null, message: 'Insufficient balance' };
        }

        // Update wallet balance
        userWallet.balance -= amount;

        // Prepare the withdrawal transaction
        const withdrawal = {
            type: 'withdraw',
            method: method,
            currency,
            amount,
            amountInUSD,
            date: new Date()
        };

        // Create transaction record
        user.transactions.push(withdrawal);

        // Save changes
        await user.save();

        // Send email notification
        await sendEmail(
            user.email,
            'Withdrawal Confirmation',
            `You have successfully withdrawn ${amount.toFixed(2)} ${currency} (worth $${amountInUSD})`
        );

        return {
            status: 'success',
            code: 200,
            data: withdrawal,
            message: 'Withdrawal successful'
        };
    } catch (error) {
        console.error('Error during withdrawal process:', error);
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
    }
};



const exchangeCurrency = async (userId, fromCurrency, fromChain, toCurrency, toChain, amount) => {
    try {
        // Convert currencies and chains to uppercase to match admin wallet records
        fromCurrency = fromCurrency.toUpperCase();
        fromChain = fromChain.toUpperCase();
        toCurrency = toCurrency.toUpperCase();
        toChain = toChain.toUpperCase();

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

        // Find the admin wallets for the specified currency and chain
        const fromAdmin = await Admin.findOne({ 'wallets.coin': fromCurrency, 'wallets.chainType': fromChain });
        const toAdmin = await Admin.findOne({ 'wallets.coin': toCurrency, 'wallets.chainType': toChain });

        if (!fromAdmin || !toAdmin) {
            console.log('Admin wallets not found for the specified currencies and chains');
            throw { status: 'error', code: 404, data: null, message: 'Admin wallets not found' };
        }

        // Find the specific admin wallets
        const fromAdminWallet = fromAdmin.wallets.find(wallet => wallet.coin.toUpperCase() === fromCurrency && wallet.chainType.toUpperCase() === fromChain);
        const toAdminWallet = toAdmin.wallets.find(wallet => wallet.coin.toUpperCase() === toCurrency && wallet.chainType.toUpperCase() === toChain);

        if (!fromAdminWallet || !toAdminWallet) {
            console.log('Admin wallets not found for the specified currencies and chains');
            throw { status: 'error', code: 404, data: null, message: 'Admin wallets not found' };
        }

        // Find the user wallets that reference the found admin wallets
        const fromWallet = user.wallets.find(wallet => wallet.adminWallet.toString() === fromAdminWallet._id.toString());
        const toWallet = user.wallets.find(wallet => wallet.adminWallet.toString() === toAdminWallet._id.toString());

        if (!fromWallet || !toWallet) {
            console.log('User wallets not found for the specified currencies and chains');
            throw { status: 'error', code: 404, data: null, message: 'User wallets not found' };
        }

        // Get the current price of the source cryptocurrency
        const fromCryptoPrice = await getCryptoPrice(fromCurrency, fromChain);

        // Check if the user has sufficient balance in the source wallet
        if (fromWallet.balance < amount) {
            console.log('Insufficient balance');
            throw { status: 'error', code: 400, data: null, message: 'Insufficient balance' };
        }

        // Get the current price of the target cryptocurrency
        const toCryptoPrice = await getCryptoPrice(toCurrency, toChain);

        // Convert source cryptocurrency amount to target cryptocurrency amount
        const toAmount = (amount * fromCryptoPrice) / toCryptoPrice;

        // Perform exchange
        fromWallet.balance -= amount;
        toWallet.balance += toAmount;

        // Prepare the exchange transaction record
        const exchangeTransaction = {
            type: 'exchange',
            fromCurrency,
            fromChain,
            toCurrency,
            toChain,
            amount: toAmount,
            amountInUSD: amount * fromCryptoPrice,
            date: new Date()
        };

        // Add the exchange transaction to user's transaction history
        user.transactions.push(exchangeTransaction);

        // Save changes to user document
        await user.save();

        // Send email notification to user
        await sendEmail(
            user.email,
            'Exchange Confirmation',
            `You have successfully exchanged ${amount} ${fromCurrency} on ${fromChain} (worth $${(amount * fromCryptoPrice).toFixed(2)}) to ${toAmount.toFixed(2)} ${toCurrency} on ${toChain}`
        );

        return {
            status: 'success',
            code: 200,
            data: exchangeTransaction,
            message: 'Currency exchanged successfully'
        };
    } catch (error) {
        console.error('Error during currency exchange process:', error);
        return { status: 'error', code: error.code || 500, data: null, message: error.message };
    }
};


const transfer = async (req, res) => {
    const userId = req.user.id; // Get user ID from auth middleware
    const { assetId, quantity, side } = req.body;

    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

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
        if (quantity > user.totalBalance * currentPrice) {
            return res.status(400).json({ status: 'error', code: 400, data: null, message: 'Insufficient balance in your account.' });
        }
        

        // Create a new trade
        const trade = {
            asset: assetId,
            quantity,
            purchasePrice : currentPrice,
            side,
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
        await sendEmail(user.email, 'Trade Opened', `You have successfully opened a trade for ${quantity} ${asset.symbol} at ${currentPrice} ${asset.symbol}`);

        // Return success response
        res.status(200).json({ status: 'success', code: 200, data: trade, message: 'Trade opened successfully' });
    } catch (error) {
        console.error('Error placing trade:', error);
        res.status(error.code || 500).json({ status: 'error', code: error.code || 500, data: null, message: error.message });
    }
};




// Deposit into wallet controller
const depositIntoWallet = async (userId, amountInUSD, currency, chain) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw { status: 'error', code: 404, data: null, message: 'User not found' };

            const cryptoPrice = await getCryptoPrice(currency);
            const amount = amountInUSD / cryptoPrice;

            const depositId = uuidv4();
            const deposit = {
                depositId,
                amount,
                currency,
                chain,
                status: 'pending',
                createdAt: new Date()
            };

            // Fetch the admin from the database (assuming there's only one admin)
            const admin = await Admin.findOne();

            if (!admin) {
                throw new Error('Admin not found');
            }

            // Find the matching wallet for the specified currency and chain type
            const wallet = admin.wallets.find(wallet =>
                wallet.coin.toLowerCase() === currency.toLowerCase() &&
                wallet.chainType.toLowerCase() === chain.toLowerCase()
            );

            if (!wallet) {
                throw new Error(`No wallet found for ${currency} on ${chain} chain`);
            }

            user.deposits.push(deposit);
            await user.save();

            await sendEmail(
                user.email,
                'Deposit Request Created',
                `You have requested a deposit of ${amountInUSD} USD worth of ${currency} on ${chain} chain. Please send ${amount} ${currency} to the following address: ${wallet.walletAddress}. Optionally use ${depositId} as the memo/tag/reference.`
            );

            return {
                status: 'success',
                code: 200,
                data: {
                    depositId,
                    address: wallet.walletAddress,
                    memo: depositId // Use depositId as memo/tag for tracking
                },
                message: 'Deposit request created successfully'
            };
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
