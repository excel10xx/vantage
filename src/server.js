const express = require('express');
const connectDB = require('./config/db');
const livePrices = require('./utils/livePrices');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
const depositRoutes = require('./routes/buyCryptoRoutes')
const tradeHistoryRoutes = require('./routes/tradeHistoryRoutes')
const accountDetailsRouters = require('./routes/accountDetailsRoutes')
const tradeMainRouters = require('./routes/tradeMainRoutes')
const getUserCopyTradingData = require('./routes/copyTradingPortfolioRoutes')
const actionsRoutes = require('./routes/actionsRoute')



const app = express();
//Middleware
app.use(express.json());


//config
(async () => await connectDB())();
(async () => await livePrices())();

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