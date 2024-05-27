const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/auth/userRegisterController');
const { verifyUser } = require('../controllers/auth/userVerifyController');
const { loginUser } = require('../controllers/auth/userLoginController');
const { resetPassword, forgotPassword } = require('../controllers/auth/userResetPasswordController');

// Route for user registration
router.post('/register', createUser);

// Route for user verification
router.post('/verify', verifyUser);

// Route for user login
router.post('/login', loginUser);

// Route for forgot password
router.post('/forgot-password', forgotPassword);

// Route for reset password
router.post('/reset-password', resetPassword);


module.exports = router;
