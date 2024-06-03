const User = require('../../models/userModel');
const ExpertTrader = require('../../models/expertTraderModel');

async function getCopyTradingExperts(req, res) {
    try {
        const userId = req.user.id;

        // Fetch the current user to check following status
        const user = await User.findById(userId).populate('followedTraders');

        // Fetch all expert traders
        const experts = await ExpertTrader.find().populate('followers');

        // Map expert traders to required format
        const expertData = experts.map(expert => {
            const isFollowing = user.followedTraders.some(trader => trader._id.equals(expert._id));
            const followersCount = expert.followers.length;

            return {
                id: expert._id,
                profilePicture: expert.profilePicture,
                name: expert.name,
                totalProfit: expert.totalProfit,
                todaysProfit: expert.todaysProfit,
                profitShare: expert.profitShare,
                followers: followersCount,
                winRate: expert.winRate,
                followersEquity: expert.followersEquity,
                rating: expert.rating,
                isFollowing: isFollowing
            };
        });

        return res.status(200).json({
            status: 'success',
            code: 200,
            data: expertData,
            message: 'Copy trading experts retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching copy trading experts:', error);
        return res.status(500).json({ status: 'error', code: 500, data: null, message: 'Internal server error' });
    }
}


module.exports = {
    getCopyTradingExperts
};
