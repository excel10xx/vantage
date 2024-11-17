const Admin = require('../../models/adminModel');
const jwt = require('jsonwebtoken');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public

const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if admin exists
        const admin = await Admin.findOne({ username });

        console.log(admin.matchPassword(password))

        if (admin && (await admin.matchPassword(password))) {
            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            });

            res.status(200).json({
                status: 'success',
                statusCode: 200,
                data: {
                    _id: admin._id,
                    username: admin.username,
                    token,
                    message: 'Login successful',
                },
            });
        } else {
            res.status(401).json({
                status: 'fail',
                statusCode: 401,
                data: {
                    message: 'Invalid username or password',
                },
            });
        }
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

module.exports = { loginAdmin };

