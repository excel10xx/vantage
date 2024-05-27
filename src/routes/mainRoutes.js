const express = require('express');
const authenticate = require('../middleware/authenticate');
const router = express.Router();
const { getAllUserDetails } = require('../controllers/main/mainController');


router.get('', authenticate, getAllUserDetails);

module.exports = router;