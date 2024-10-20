const User = require('../../models/userModel');
const Admin = require('../../models/adminModel');

async function getWalletDetails(req, res) {
    const userId = req.user.id;
    let { currency, chain} = req.params;
    currency = currency.toUpperCase();
    chain = chain.toUpperCase()
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
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
        const wallet = user.wallets.find(wallet =>
            wallet.adminWallet.toString() === adminWallet._id.toString()
        );

        if (!wallet) {
            console.log('User wallet not found for the specified admin wallet');
            throw { status: 'error', code: 404, data: null, message: 'User wallet not found' };
        }

        // Construct the wallet details response
        const walletDetails = {
            network: adminWallet.chainType,
            wallet: {
                image: adminWallet.image,
                currency: adminWallet.coin,
                address: adminWallet.walletAddress,
                chain: adminWallet.chainType,
                balance: wallet.balance
            }
        };


        // Response with the wallet details
        return res.status(200).json({ status: 'success', code: 200, data: walletDetails, message: 'Wallet details retrieved successfully' });
    } catch (error) {
        console.error('Error fetching wallet details:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

// Get all coins and their chains, or just chains for a specific coin
const getCoinsAndChains = async (req, res) => {
    const { coin } = req.query;  // Access the query parameter for coin

    try {
        // Find all admin wallets (assuming all wallets are under one admin)
        const admin = await Admin.findOne().select('wallets');

        if (!admin || !admin.wallets.length) {
            return res.status(404).json({ status: 'fail', message: 'No wallets found' });
        }

        // If a coin is provided, filter the wallets to return only chains for that coin
        if (coin) {
            const filteredWallets = admin.wallets.filter(wallet => wallet.coin.toLowerCase() === coin.toLowerCase());

            if (!filteredWallets.length) {
                return res.status(404).json({ status: 'fail', message: `No chains found for coin: ${coin}` });
            }

            // Return only the chains for the specific coin
            const chainsForCoin = filteredWallets.map(wallet => ({
                chainType: wallet.chainType,
                walletAddress: wallet.walletAddress,
            }));

            return res.status(200).json({ status: 'success', data: { coin, chains: chainsForCoin } });
        }

        // If no coin is provided, return all coins and their respective chains
        const allCoinsAndChains = admin.wallets.map(wallet => ({
            coin: wallet.coin,
            chainType: wallet.chainType,
            walletAddress: wallet.walletAddress,
        }));

        res.status(200).json({ status: 'success', data: allCoinsAndChains });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
    }
};

module.exports = { getCoinsAndChains };

module.exports = {
    getWalletDetails,
    getCoinsAndChains
};
