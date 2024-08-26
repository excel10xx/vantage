const express = require('express');
const connectDB = require('./config/db');
const livePrices = require('./utils/livePrices');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
require('./config/passportConfig');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
const depositRoutes = require('./routes/buyCryptoRoutes');
const tradeHistoryRoutes = require('./routes/tradeHistoryRoutes');
const accountDetailsRoutes = require('./routes/accountDetailsRoutes');
const tradeMainRoutes = require('./routes/tradeMainRoutes');
const getUserCopyTradingData = require('./routes/copyTradingPortfolioRoutes');
const getCopyTradingExperts = require('./routes/copyTradingRatingsRoute');
const actionsRoutes = require('./routes/actionsRoute');
const kycRoutes = require('./routes/kycRoutes'); 
const settingsRoutes = require('./routes/settingsRoutes'); 
const clientContentRoutes = require('./routes/contentRoutes');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Config
(async () => await connectDB())();
// (async () => await livePrices())();

// Initialize session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));

// GET Routes
app.use('/api/auth', authRoutes);
app.use('/api/main', mainRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/trade/history', tradeHistoryRoutes);
app.use('/api/account/details', accountDetailsRoutes);
app.use('/api/trade/main', tradeMainRoutes);
app.use('/api/copytrading/portfolio', getUserCopyTradingData);
app.use('/api/copytrading/ratings', getCopyTradingExperts);
app.use('/api/kyc', kycRoutes); // Include KYC routes
app.use('/api/settings', settingsRoutes); // Include settings routes
app.use('/api/content', clientContentRoutes);

//POST Routes
app.use('/api/actions', actionsRoutes);

//Admin Routes
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));