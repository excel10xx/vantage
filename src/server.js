const express = require('express');
const connectDB = require('./config/db');
const livePrices = require('./utils/livePrices');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
require('./config/passportConfig');


const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
const depositRoutes = require('./routes/buyCryptoRoutes')
const tradeHistoryRoutes = require('./routes/tradeHistoryRoutes')
const accountDetailsRouters = require('./routes/accountDetailsRoutes')
const tradeMainRouters = require('./routes/tradeMainRoutes')
const getUserCopyTradingData = require('./routes/copyTradingPortfolioRoutes')
const actionsRoutes = require('./routes/actionsRoute')
const path = require('path');


const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//config
(async () => await connectDB())();
(async () => await livePrices())();

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

//Static
app.use('/public', express.static(path.join(__dirname, 'public')));

//GET Routes
app.use('/api/auth', authRoutes); 
app.use('/api/main', mainRoutes);
app.use('/api/deposit', depositRoutes); 
app.use('/api/trade/history', tradeHistoryRoutes);
app.use('/api/account/details', accountDetailsRouters);
app.use('/api/trade/main', tradeMainRouters);
app.use('/api/copytrading/portfolio', getUserCopyTradingData);


//POST Routes
app.use('/api/actions', actionsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));