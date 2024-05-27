const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['stock', 'cryptocurrency'], required: true },
    price: { type: Number, required: true }
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;