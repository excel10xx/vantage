const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const createWallets = require('../../utils/createWallets');
require('dotenv').config();

// Controller function to verify user by verification code
const verifyUser = async (req, res) => {
    try {
        // Extract verification code from request body
        const { verificationCode } = req.body;

        // Find user by verification code
        const user = await User.findOne({ verificationCode });

        // If user is not found or already verified, return error
        if (!user || user.emailVerified) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                data: 'Invalid verification code'
            });
        }

        // Set user's emailVerified to true
        user.emailVerified = true;

        // Generate wallets
        const wallets = await Promise.all([
            createWallets.generateBitcoinWallet(),
            createWallets.generateEthereumWallet(),
            createWallets.generateUSDTWallet(),
            createWallets.generateUSDCWallet(),
            createWallets.generateSolanaWallet(),
            createWallets.generateBNBWallet(),
            createWallets.generateRippleWallet(),
            createWallets.generateDogecoinWallet(),
        ]);

        // Add generated wallets to user's wallet array
        user.wallets = wallets;

        // Reset User Verification
        user.verificationCode = undefined;

        // Save user
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

        // Respond with success message and token
        res.status(200).json({
            status: 'success',
            code: 200,
            data: { jwt: token, message: 'User verified successfully' }
        });
    } catch (error) {
        // Handle error
        console.error('Error verifying user:', error);
        res.status(500).json({
            status: 'error',
            code: 500,
            data: 'Internal server error'
        });
    }
};

module.exports = {
    verifyUser
};
