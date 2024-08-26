const User = require('../../models/userModel');
const Asset = require('../../models/assetsModel');
const Admin = require('../../models/adminModel');

async function getCryptoAccountDetails(req, res) {
    const userId = req.user.id;
    let { cryptocurrency, chain } = req.params;

    cryptocurrency = cryptocurrency.toUpperCase();
    chain = chain.toUpperCase();

    try {
        // Find the user by ID
        const user = await User.findById(userId).populate('wallets');
        if (!user) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'User not found' });
        }

        // Find the admin wallet with the specified currency and chain
        const admin = await Admin.findOne({ 'wallets.coin': cryptocurrency, 'wallets.chainType': chain});
        if (!admin) {
            console.log('Admin wallet reference not found for the specified currency and chain');
            throw { status: 'error', code: 404, data: null, message: 'Admin reference wallet not found' };
        }

        const adminWallet = admin.wallets.find(wallet =>
            wallet.coin.toUpperCase() === cryptocurrency && wallet.chainType.toUpperCase() === chain
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



        // Fetch the current price for the specified cryptocurrency
        const asset = await Asset.findOne({ symbol: cryptocurrency.toUpperCase() });
        if (!asset) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Asset not found' });
        }
        const currentPrice = asset.price;

        // Calculate account details
        const accountMargin = wallet.balance * currentPrice;
        const equity = accountMargin; // Assuming equity is the same as account margin for simplicity
        const unrealizedPL =  wallet.balance * 0.75; // Placeholder logic
        const usedMargin = accountMargin * 0.25; // Example: 25% of account margin is used
        const availableMargin = accountMargin - usedMargin;
        const availableMarginPercent = (availableMargin / accountMargin) * 100;
        const bonus = availableMargin * 0.02; // Placeholder for bonus, modify as per your bonus logic

        const accountDetails = {
            network: wallet.chain,
            wallet: wallet.balance,
            address: wallet.address,
            accountMargin: accountMargin,
            equity: equity,
            unrealizedPL: unrealizedPL,
            usedMargin: usedMargin,
            availableMargin: availableMargin,
            availableMarginPercent: availableMarginPercent,
            bonus: bonus
        };

        // Return the account details
        return res.status(200).json({ status: 'success', code: 200, data: accountDetails, message: 'Account details retrieved successfully' });
    } catch (error) {
        console.error('Error fetching account details:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    getCryptoAccountDetails
};
