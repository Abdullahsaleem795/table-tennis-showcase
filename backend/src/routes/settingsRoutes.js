const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const settingsUploads = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

router.get('/', settingsController.getSettings);
router.put('/', authMiddleware, settingsUploads, settingsController.updateSettings);

module.exports = router;
