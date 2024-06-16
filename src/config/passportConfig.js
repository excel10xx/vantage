const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/userModel');

// Google OAuth configuration
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or create a user based on Google profile
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        emailVerified: true, // Assuming Google OAuth always provides verified email
                        profilePicture: profile.photos[0].value
                    });
                    await user.save();

                    // Generate wallets for the user
                    const wallets = await Promise.all([
                        createWallets.generateBitcoinWallet(),
                        createWallets.generateEthereumWallet(),
                        createWallets.generateUSDTWallet(),
                        createWallets.generateUSDCWallet(),
                        createWallets.generateSolanaWallet(),
                        createWallets.generateBNBWallet(),
                        createWallets.generateRippleWallet(),
                        createWallets.generateDogecoinWallet(),
                    ]);
                    // Assign wallets to the user
                    user.wallets = wallets;
                    // Save user with wallets
                    await user.save();
                }
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

// Twitter OAuth configuration
passport.use(
    new TwitterStrategy(
        {
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: process.env.TWITTER_CALLBACK_URL,
            includeEmail: true // Ensure email is requested
        },
        async (token, tokenSecret, profile, done) => {
            try {
                // Find or create a user based on Twitter profile
                let user = await User.findOne({ twitterId: profile.id });
                if (!user) {
                    user = new User({
                        twitterId: profile.id,
                        name: profile.displayName,
                        profilePicture: profile.photos[0].value,
                        email: profile.emails[0].value, // Assuming email is included
                        emailVerified: true // Twitter OAuth doesn't require email verification
                    });
                    await user.save();

                    // Generate wallets for the user
                    const wallets = await Promise.all([
                        createWallets.generateBitcoinWallet(),
                        createWallets.generateEthereumWallet(),
                        createWallets.generateUSDTWallet(),
                        createWallets.generateUSDCWallet(),
                        createWallets.generateSolanaWallet(),
                        createWallets.generateBNBWallet(),
                        createWallets.generateRippleWallet(),
                        createWallets.generateDogecoinWallet(),
                    ]);
                    // Assign wallets to the user
                    user.wallets = wallets;
                    // Save user with wallets
                    await user.save();
                }
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
