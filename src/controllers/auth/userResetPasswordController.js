const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');
const bcrypt = require('bcrypt');

// Controller function for forgot password
const forgotPassword = async (req, res) => {
    try {
        // Extract email from request body
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // If user not found, return error
        if (!user) {
            return res.status(404).json({
                status: 'error',
                code: 404,
                data: 'User not found'
            });
        }

        // Generate unique verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000); // Generate a random code

        // Store verification code in user document
        user.verificationCode = verificationCode;
        await user.save();

        // Send email with verification code
        const verificationSubject = 'Reset Password Verification Code';
        const verificationText = `Your verification code to reset your password is: ${verificationCode}`;
        await sendEmail(user.email, verificationSubject, verificationText);

        // Respond with success message
        res.status(200).json({
            status: 'success',
            code: 200,
            data: 'Verification code sent to your email'
        });
    } catch (error) {
        // Handle error
        console.error('Error sending verification code:', error);
        res.status(500).json({
            status: 'error',
            code: 500,
            data: 'Internal server error'
        });
    }
};

// Controller function for password reset
const resetPassword = async (req, res) => {
    try {
        // Extract verification code and new password from request body
        const { verificationCode, newPassword } = req.body;

        // Find user by verification code
        const user = await User.findOne({ verificationCode });

        // If user not found or verification code invalid, return error
        if (!user) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                data: 'Invalid verification code'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        user.verificationCode = undefined; // Clear verification code
        await user.save();

        // Respond with success message
        res.status(200).json({
            status: 'success',
            code: 200,
            data: 'Password reset successfully'
        });
    } catch (error) {
        // Handle error
        console.error('Error resetting password:', error);
        res.status(500).json({
            status: 'error',
            code: 500,
            data: 'Internal server error'
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};
