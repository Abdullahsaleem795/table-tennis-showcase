const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

const { protect } = require('../middleware/auth');

// POST /api/certificates/send
router.post('/send', protect, certificateController.sendCertificate);

module.exports = router;
