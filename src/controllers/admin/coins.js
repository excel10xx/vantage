const Admin = require('../../models/adminModel');
const Asset = require('../../models/assetsModel');
const User = require('../../models/userModel');

// Create a new wallet
const createWallet = async (req, res) => {
    const { coin, image, chainType, walletAddress } = req.body;

    if (!coin || !image || !chainType || !walletAddress) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'All fields are required',
            },
        });
    }

    try {
        // Check if the coin symbol is supported
        const supportedAsset = await Asset.findOne({ symbol: coin, type: 'cryptocurrency' });

        if (!supportedAsset) {
            return res.status(400).json({
                status: 'fail',
                statusCode: 400,
                data: {
                    message: 'Unsupported coin. Please make sure the coin is one of the supported assets.',
                },
            });
        }

        const admin = await Admin.findById(req.admin._id);

        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Admin not found',
                },
            });
        }

        // Create the new wallet object
        const newWallet = { coin, image, chainType, walletAddress };

        // Push the new wallet to the admin's wallets array
        admin.wallets.push(newWallet);
        await admin.save();

        // Find the newly created wallet by matching its walletAddress
        const createdWallet = admin.wallets.find(wallet => wallet.walletAddress === walletAddress);

        if (!createdWallet) {
            return res.status(500).json({
                status: 'error',
                statusCode: 500,
                data: {
                    message: 'Error finding the newly created wallet',
                },
            });
        }

        // Update all users with the new wallet
        await User.updateMany({}, {
            $push: {
                wallets: {
                    adminWallet: createdWallet._id,
                    balance: 0,
                    pending: 0,
                }
            }
        });

        res.status(201).json({
            status: 'success',
            statusCode: 201,
            data: {
                message: 'Wallet created successfully',
                wallet: { id: createdWallet._id, coin, image, chainType, walletAddress },
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message,
            },
        });
    }
};


// Get all wallets
const getAllWallets = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);

        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Admin not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                wallets: admin.wallets,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message,
            },
        });
    }
};

// Update a wallet
const updateWallet = async (req, res) => {
    const { id } = req.params;
    const { coin, image, chainType, walletAddress } = req.body;

    try {
        const admin = await Admin.findById(req.admin._id);

        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Admin not found',
                },
            });
        }

        const wallet = admin.wallets.id(id);

        if (!wallet) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Wallet not found',
                },
            });
        }

        wallet.coin = coin || wallet.coin;
        wallet.image = image || wallet.image;
        wallet.chainType = chainType || wallet.chainType;
        wallet.walletAddress = walletAddress || wallet.walletAddress;

        await admin.save();

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Wallet updated successfully',
                wallet,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message,
            },
        });
    }
};

// Delete a wallet
const deleteWallet = async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await Admin.findById(req.admin._id);

        if (!admin) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Admin not found',
                },
            });
        }

        // Find and remove the wallet by its ID
        const walletIndex = admin.wallets.findIndex(wallet => wallet._id.toString() === id);

        if (walletIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Wallet not found',
                },
            });
        }

        // Get the wallet to be deleted
        const walletToDelete = admin.wallets[walletIndex];

        // Remove the wallet from the admin's wallet array
        admin.wallets.splice(walletIndex, 1);
        await admin.save();

        // Remove the wallet from all users
        await User.updateMany(
            {},
            { $pull: { wallets: { adminWallet: walletToDelete._id } } }
        );

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Wallet deleted successfully',
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message,
            },
        });
    }
};
module.exports = { createWallet, getAllWallets, updateWallet, deleteWallet };
