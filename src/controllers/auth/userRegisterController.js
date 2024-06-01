const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const sendEmail = require('../../utils/sendEmail');
require('dotenv').config();

// Controller function to create a user with email verification and generate wallets
const createUser = async (req, res) => {
    try {
        // Extract user data from request body
        const { name, email, password } = req.body;

        // Check if a user with the given email already exists
        const existingUser = await User.findOne({ email });

        // If user already exists, return error
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                data: 'User already exists'
            });
        }

        // Generate a four-digit numeric verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with name, email, hashed password, and verification code
        const user = new User({ name, email, password: hashedPassword, verificationCode });

        // Save user to the database
        await user.save();

        // Send verification email with verification code
        const verificationSubject = 'Verify your email';
        const verificationText = `Your verification code is: ${verificationCode}`;
        await sendEmail(user.email, verificationSubject, verificationText);

        // Respond with success message
        res.status(201).json({
            status: 'success',
            code: 201,
            data: 'User created successfully'
        });
    } catch (error) {
        // Handle error
        console.error('Error creating user:', error);
        res.status(500).json({
            status: 'error',
            code: 500,
            data: 'Internal server error'
        });
    }
};

module.exports = {
    createUser
};
