const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const protect = require('../middleware/auth');

// Public route to view tournament status & brackets
router.get('/', tournamentController.getTournament);

// Protected Admin routes
router.post('/generate', protect, tournamentController.generateTournament);
router.post('/winner', protect, tournamentController.selectWinner);
router.post('/reset', protect, tournamentController.resetTournament);

module.exports = router;
