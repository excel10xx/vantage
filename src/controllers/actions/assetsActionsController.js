const Asset = require('../../models/assetsModel');


async function convertAsset(req, res) {
    const { amount, fromAsset, toAsset } = req.query;

    if (!amount || !fromAsset || !toAsset) {
        return res.status(400).json({ status: 'error', code: 400, data: null, message: 'Missing query parameters' });
    }

    try {
        // Find the assets by their symbols
        const fromAssetData = await Asset.findOne({ symbol: fromAsset.toUpperCase() });
        const toAssetData = await Asset.findOne({ symbol: toAsset.toUpperCase() });

        if (!fromAssetData || !toAssetData) {
            return res.status(404).json({ status: 'error', code: 404, data: null, message: 'Asset not found' });
        }

        // Calculate the converted amount
        const convertedAmount = (amount * fromAssetData.price) / toAssetData.price;

        // Return the converted amount
        return res.status(200).json({
            status: 'success',
            code: 200,
            data: { fromAsset: fromAssetData.symbol, toAsset: toAssetData.symbol, convertedAmount },
            message: 'Asset conversion successful'
        });
    } catch (error) {
        console.error('Error converting asset:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}

module.exports = {
    convertAsset
};
