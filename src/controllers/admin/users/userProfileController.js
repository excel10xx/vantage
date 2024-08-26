const User = require('../../../models/userModel'); 

// Controller to get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message
            }
        });
    }
};

// Controller to get a single user by ID
const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'User not found'
                }
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message
            }
        });
    }
};



// Controller to update user's name
const updateUserName = async (req, res) => {
    const { userId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'Name is required'
            }
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'User not found'
                }
            });
        }

        user.name = name;
        await user.save();

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'User name updated successfully',
                user: {
                    id: user._id,
                    name: user.name
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message
            }
        });
    }
};

// Controller to update user's email
const updateUserEmail = async (req, res) => {
    const { userId } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'Email is required'
            }
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'User not found'
                }
            });
        }

        user.email = email;
        await user.save();

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'User email updated successfully',
                user: {
                    id: user._id,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message
            }
        });
    }
};

// Controller to update user's profile picture
const updateUserProfilePicture = async (req, res) => {
    const { userId } = req.params;
    const { profilePicture } = req.body;

    if (!profilePicture) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'Profile picture is required'
            }
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'User not found'
                }
            });
        }

        user.profilePicture = profilePicture;
        await user.save();

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'User profile picture updated successfully',
                user: {
                    id: user._id,
                    profilePicture: user.profilePicture
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message
            }
        });
    }
};

// Controller to update user's Google ID
const updateUserGoogleId = async (req, res) => {
    const { userId } = req.params;
    const { googleId } = req.body;

    if (!googleId) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'Google ID is required'
            }
        });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'User not found'
                }
            });
        }

        user.googleId = googleId;
        await user.save();

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'User Google ID updated successfully',
                user: {
                    id: user._id,
                    googleId: user.googleId
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            data: {
                message: 'Server error',
                error: error.message
            }
        });
    }
};

// Export the controllers
module.exports = {
    getAllUsers,
    getUserById,
    updateUserName,
    updateUserEmail,
    updateUserProfilePicture,
    updateUserGoogleId
};
