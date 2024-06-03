const User = require('../../models/userModel');

// Get user settings and login history
const getUserSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('settings loginHistory email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ settings: user.settings, loginHistory: user.loginHistory, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user settings
const updateUserSettings = async (req, res) => {
    const updates = req.body;

    // Prevent accountVerified from being updated by the user
    if ('accountVerified' in updates) delete updates.accountVerified;

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { 'settings': updates } },
            { new: true, runValidators: true, context: 'query' }
        ).select('settings loginHistory email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ settings: user.settings, loginHistory: user.loginHistory, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserSettings,
    updateUserSettings
};
