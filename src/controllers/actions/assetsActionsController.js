const Asset = require('../../models/assetsModel');
const User = require('../../models/userModel');

async function getAssetPrice(req, res) {
    const { symbol } = req.params;

    try {
        // Find the asset by symbol
        const asset = await Asset.findOne({ symbol: symbol.toUpperCase() });

        if (!asset) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Asset not found' });
        }

        // Return the current price of the asset
        return res.status(200).json({
            status: 'success',
            code: 200,
            data: { symbol: asset.symbol, name: asset.name, price: asset.price },
            message: 'Asset price retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching asset price:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    getAssetPrice
};
