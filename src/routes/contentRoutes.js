const express = require('express');
const router = express.Router();
const { getAllArticles, getAllCourses, getAllPromoCodes, } = require('../controllers/admin/content');

// Public Article Routes
router.get('/articles', getAllArticles);

// Public Course Routes
router.get('/courses', getAllCourses);

// Public Promo Code Routes
router.get('/promocodes', getAllPromoCodes);

module.exports = router;
