const express = require('express');
const { createUser } = require('../controllers/auth/userRegisterController');
const { verifyUser } = require('../controllers/auth/userVerifyController');
const { loginUser } = require('../controllers/auth/userLoginController');
const { resetPassword, forgotPassword } = require('../controllers/auth/userResetPasswordController');
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('../config/passportConfig');


const router = express.Router();

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

//Google OAuth route
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        // Successful authentication, generate JWT and redirect to frontend
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
        const redirectUrl = `${process.env.FRONTEND_URL}?jwt=${token}`;
        res.redirect(redirectUrl);
    }
);

// Twitter OAuth route
router.get('/twitter', passport.authenticate('twitter'));

// Twitter OAuth callback route
router.get(
    '/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    async (req, res) => {
        // Successful authentication, generate JWT and redirect to frontend
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7h' });
        const redirectUrl = `${process.env.FRONTEND_URL}?jwt=${token}`;
        res.redirect(redirectUrl);
    }
);

module.exports = router;
