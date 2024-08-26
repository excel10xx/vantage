const mongoose = require('mongoose');
const Article = require('../models/Article');  // Adjust the path as needed
const Course = require('../models/Course');    // Adjust the path as needed
const PromoCode = require('../models/PromoCode');  // Adjust the path as needed
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Function to seed articles
const seedArticles = async () => {
    const articles = [
        {
            title: 'Understanding Stock Market Trends',
            body: 'Learn about the key trends in the stock market, including bull and bear markets, and how they impact trading strategies.',
            image: 'public/content/article.jpg',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-10'),
        },
        {
            title: 'Introduction to Cryptocurrency Trading',
            body: 'An overview of cryptocurrency trading, including how to start trading, the risks involved, and the basics of major cryptocurrencies like Bitcoin and Ethereum.',
            image: 'public/content/article.jpg',
            createdAt: new Date('2023-02-15'),
            updatedAt: new Date('2023-02-20'),
        },
        {
            title: 'Advanced Techniques in Forex Trading',
            body: 'Explore advanced forex trading techniques including technical analysis, algorithmic trading, and risk management strategies.',
            image: 'public/content/article.jpg',
            createdAt: new Date('2023-03-05'),
            updatedAt: new Date('2023-03-12'),
        },
    ];

    await Article.insertMany(articles);
    console.log('Seeded Articles');
};

// Function to seed courses
const seedCourses = async () => {
    const courses = [
        {
            title: 'Stock Market Fundamentals',
            summary: 'A comprehensive course covering the basics of stock markets, including trading strategies, market analysis, and risk management.',
            level: 'Beginner',
            link: 'https://example.com/course_stock_fundamentals',
            createdAt: new Date('2023-04-01'),
            updatedAt: new Date('2023-04-05'),
        },
        {
            title: 'Mastering Crypto Trading',
            summary: 'An in-depth course on cryptocurrency trading, including advanced trading techniques, market analysis, and portfolio management.',
            level: 'Advanced',
            link: 'https://example.com/course_crypto_mastery',
            createdAt: new Date('2023-05-10'),
            updatedAt: new Date('2023-05-15'),
        },
        {
            title: 'Technical Analysis for Traders',
            summary: 'Learn technical analysis methods used in trading stocks and cryptocurrencies, including chart patterns, indicators, and trading signals.',
            level: 'Intermediate',
            link: 'https://example.com/course_technical_analysis',
            createdAt: new Date('2023-06-20'),
            updatedAt: new Date('2023-06-25'),
        },
    ];

    await Course.insertMany(courses);
    console.log('Seeded Courses');
};

// Function to seed promo codes
const seedPromoCodes = async () => {
    const promoCodes = [
        {
            code: 'STOCK20',
            type: 'Discount',
            conditions: 'Get 20% off on all stock trading courses. Valid for one-time use only.',
            createdAt: new Date('2023-07-01'),
            updatedAt: new Date('2023-07-05'),
        },
        {
            code: 'CRYPTOFREE',
            type: 'Free Trial',
            conditions: 'Access to any crypto trading course for free for the first 14 days.',
            createdAt: new Date('2023-08-10'),
            updatedAt: new Date('2023-08-12'),
        },
        {
            code: 'TRADINGCASHBACK',
            type: 'Cashback',
            conditions: 'Get 10% cashback on your first purchase of trading courses.',
            createdAt: new Date('2023-09-15'),
            updatedAt: new Date('2023-09-20'),
        },
    ];

    await PromoCode.insertMany(promoCodes);
    console.log('Seeded Promo Codes');
};

// Seed all data
const seedAll = async () => {
    await seedArticles();
    await seedCourses();
    await seedPromoCodes();

    mongoose.connection.close();
};

// Execute the seed script
seedAll().catch(err => {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
});
