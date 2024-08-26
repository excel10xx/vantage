const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');
const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');
require('dotenv').config();

// Controller function to handle user login
const loginUser = async (req, res) => {
    try {
        // Extract email and password from request body
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // If user not found or password incorrect, return error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                data: 'Invalid email or password'
            });
        }

        // Check if the user's email is verified
        if (!user.emailVerified) {
            return res.status(403).json({
                status: 'error',
                code: 403,
                data: 'Email not verified'
            });
        }

        // Update login history
        const { ip, headers } = req;
        const ipAddress = ip || headers['x-forwarded-for'] || headers['x-real-ip'] || req.connection.remoteAddress;
        const location = geoip.lookup(ipAddress);
        const device = headers['user-agent'];

        user.loginHistory.push({
            status: 'success',
            location: location?.city || 'Unknown',
            device,
            ipAddress
        });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        // Send email with login details
        const loginSubject = 'Successful Login';
        const loginText = `You have successfully logged in from ${location?.city || 'Unknown'}, ${location?.country || 'Unknown'} using ${device}.`;
        await sendEmail(user.email, loginSubject, loginText);

        // Respond with token
        res.status(200).json({
            status: 'success',
            code: 200,
            data: { jwt: token, message: "Login successful" }
        });
    } catch (error) {
        // Handle error
        console.error('Error logging in user:', error);
        res.status(500).json({
            status: 'error',
            code: 500,
            data: 'Internal server error'
        });
    }
};

module.exports = {
    loginUser
};

