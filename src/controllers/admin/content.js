// controllers/contentController.js
const Article = require('../../models/Article');
const Course = require('../../models/Course');
const PromoCode = require('../../models/PromoCode');

// Article Controllers--------------------------------------------------------------------------------------------------------------------------------

// Create a new article
const createArticle = async (req, res) => {
    const { title, body, image } = req.body;

    if (!title || !body) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'Title and body are required',
            },
        });
    }

    try {
        const article = await Article.create({ title, body, image });
        res.status(201).json({
            status: 'success',
            statusCode: 201,
            data: {
                message: 'Article created successfully',
                article,
            },
        });
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

// Get all articles
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                articles,
            },
        });
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

// Update an article
const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, body, image } = req.body;

    try {
        const article = await Article.findByIdAndUpdate(
            id,
            { title, body, image, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!article) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Article not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Article updated successfully',
                article,
            },
        });
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

// Delete an article
const deleteArticle = async (req, res) => {
    const { id } = req.params;

    try {
        const article = await Article.findByIdAndDelete(id);

        if (!article) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Article not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Article deleted successfully',
            },
        });
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
//----------------------------------------------------------------------------------------------------------------------------------------------------------



// Course Controllers---------------------------------------------------------------------------------------------------------------------------------------

// Create a new course
const createCourse = async (req, res) => {
    const { title, summary, level, link } = req.body;

    if (!title || !summary || !level || !link) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'All fields are required',
            },
        });
    }

    try {
        const course = await Course.create({ title, summary, level, link });
        res.status(201).json({
            status: 'success',
            statusCode: 201,
            data: {
                message: 'Course created successfully',
                course,
            },
        });
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

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                courses,
            },
        });
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

// Update a course
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, summary, level, link } = req.body;

    try {
        const course = await Course.findByIdAndUpdate(
            id,
            { title, summary, level, link, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Course not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Course updated successfully',
                course,
            },
        });
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

// Delete a course
const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Course not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Course deleted successfully',
            },
        });
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
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Promo Code Controllers----------------------------------------------------------------------------------------------------------------------------------------------

// Create a new promo code
const createPromoCode = async (req, res) => {
    const { code, type, conditions } = req.body;

    if (!code || !type || !conditions) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            data: {
                message: 'All fields are required',
            },
        });
    }

    try {
        const promoCode = await PromoCode.create({ code, type, conditions });
        res.status(201).json({
            status: 'success',
            statusCode: 201,
            data: {
                message: 'Promo code created successfully',
                promoCode,
            },
        });
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

// Get all promo codes
const getAllPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find();
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                promoCodes,
            },
        });
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

// Update a promo code
const updatePromoCode = async (req, res) => {
    const { id } = req.params;
    const { code, type, conditions } = req.body;

    try {
        const promoCode = await PromoCode.findByIdAndUpdate(
            id,
            { code, type, conditions, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!promoCode) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Promo code not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Promo code updated successfully',
                promoCode,
            },
        });
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

// Delete a promo code
const deletePromoCode = async (req, res) => {
    const { id } = req.params;

    try {
        const promoCode = await PromoCode.findByIdAndDelete(id);

        if (!promoCode) {
            return res.status(404).json({
                status: 'fail',
                statusCode: 404,
                data: {
                    message: 'Promo code not found',
                },
            });
        }

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            data: {
                message: 'Promo code deleted successfully',
            },
        });
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
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
    createArticle,
    getAllArticles,
    updateArticle,
    deleteArticle,
    createCourse,
    getAllCourses,
    updateCourse,
    deleteCourse,
    createPromoCode,
    getAllPromoCodes,
    updatePromoCode,
    deletePromoCode,
};
