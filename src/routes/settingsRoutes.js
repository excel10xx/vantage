const express = require('express');
const { getUserSettings, updateUserSettings } = require('../controllers/settings/settings');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, getUserSettings);
router.put('/', authenticate, updateUserSettings);

module.exports = router;
