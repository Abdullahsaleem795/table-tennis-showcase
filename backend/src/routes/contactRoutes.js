const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// POST /api/contact
router.post('/', contactLimiter, contactController.sendContactMessage);

module.exports = router;
