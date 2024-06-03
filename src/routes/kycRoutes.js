const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const kycController = require('../controllers/kyc/kyc');

// Get KYC details
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await kycController.getKYC(userId);
        res.status(result.code).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', code: 500, message: error.message });
    }
});

// Update KYC details
router.put('/', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const kycData = req.body; // Assuming request body contains updated KYC data
        const result = await kycController.updateKYC(userId, kycData);
        res.status(result.code).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', code: 500, message: error.message });
    }
});

module.exports = router;
