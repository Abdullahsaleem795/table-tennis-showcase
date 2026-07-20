const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const playerUploads = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]);

router.get('/', playerController.getAllPlayers);
router.get('/stats', playerController.getStats);
router.get('/:id', playerController.getPlayerById);

router.post('/', authMiddleware, playerUploads, playerController.createPlayer);
router.put('/:id', authMiddleware, playerUploads, playerController.updatePlayer);
router.delete('/:id', authMiddleware, playerController.deletePlayer);

module.exports = router;
