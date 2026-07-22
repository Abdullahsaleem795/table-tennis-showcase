const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const protect = require('../middleware/auth');

// Public endpoints
router.get('/', pollController.getPollStatus);
router.post('/vote/:id', pollController.submitVote);

// Protected Admin configuration endpoint
router.post('/configure', protect, pollController.configurePoll);
router.post('/reset', protect, pollController.resetPoll);

module.exports = router;
