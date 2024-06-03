const User = require('../../models/userModel');

async function getWalletDetails(req, res) {
    const userId = req.user.id;
    let { currency } = req.params;
    currency = currency.toUpperCase();
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Find the wallet for the given currency
        const wallet = user.wallets.find(w => w.currency === currency);
        if (!wallet) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: `No wallet found for currency: ${currency}` });
        }

        // Construct the wallet details response
        const walletDetails = {
            network: wallet.chain,
            wallet: {
                image: wallet.logoPath,
                currency: wallet.currency,
                address: wallet.address,
                chain: wallet.chain,
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

module.exports = {
    getWalletDetails
};
