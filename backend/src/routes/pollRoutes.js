const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const protect = require('../middleware/auth');

const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 attempts per hour
  message: { message: 'Too many voting attempts from this IP, please try again later.' }
});

// Public endpoints
router.get('/', pollController.getPollStatus);
router.post('/vote/:id', voteLimiter, pollController.submitVote);

// Protected Admin configuration endpoint
router.post('/configure', protect, pollController.configurePoll);
router.post('/reset', protect, pollController.resetPoll);

module.exports = router;
