const express = require('express');
const { sendEmergencyAlert } = require('../controllers/sosController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protected route - only authenticated users can send emergency alerts
router.post('/emergency', authMiddleware, sendEmergencyAlert);

module.exports = router;
