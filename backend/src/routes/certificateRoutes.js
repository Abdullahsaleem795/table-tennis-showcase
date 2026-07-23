const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// POST /api/certificates/send
router.post('/send', certificateController.sendCertificate);

module.exports = router;
