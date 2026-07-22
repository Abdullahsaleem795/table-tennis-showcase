const fs = require('fs');
const path = require('path');
const playerService = require('../services/playerService');

// Helper to convert uploaded files to Base64 strings
function fileToBase64(file) {
  if (!file) return '';
  try {
    const fileData = file.buffer || fs.readFileSync(file.path);
    const base64String = fileData.toString('base64');
    return `data:${file.mimetype};base64,${base64String}`;
  } catch (err) {
    console.error("Error converting file to Base64:", err);
    return '';
  }
}

// Helper to delete local uploads
function deleteLocalFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  
  const filename = fileUrl.replace('/uploads/', '');
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error(`Error deleting file: ${filePath}`, unlinkErr);
      });
    }
  });
}

module.exports = {
  async getAllPlayers(req, res, next) {
    try {
      const players = await playerService.getAll();
      res.json(players);
    } catch (err) {
      next(err);
    }
  },

  async getPlayerById(req, res, next) {
    try {
      const player = await playerService.getById(req.params.id);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      res.json(player);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req, res, next) {
    try {
      const totalPlayers = await playerService.count();
      const totalPhotos = await playerService.getTotalPhotos();
      const totalVideos = await playerService.getTotalVideos();
      res.json({
        totalPlayers,
        totalPhotos,
        totalVideos
      });
    } catch (err) {
      next(err);
    }
  },

  async createPlayer(req, res, next) {
    try {
      const { name, rank, playingStyle, playingHand, biography, country } = req.body;
      
      if (!name || !rank || !playingStyle || !playingHand) {
        return res.status(400).json({ message: 'Name, rank, playingStyle, and playingHand are required.' });
      }

      // Parse JSON sub-objects
      let equipment = {};
      if (req.body.equipment) {
        try {
          equipment = typeof req.body.equipment === 'string' ? JSON.parse(req.body.equipment) : req.body.equipment;
        } catch (e) {
          return res.status(400).json({ message: 'Invalid equipment structure' });
        }
      }

      let achievements = [];
      if (req.body.achievements) {
        try {
          achievements = typeof req.body.achievements === 'string' ? JSON.parse(req.body.achievements) : req.body.achievements;
        } catch (e) {
          achievements = [];
        }
      }

      // Handle avatar file (Base64)
      let avatarUrl = '';
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        const file = req.files.avatar[0];
        avatarUrl = fileToBase64(file);
        // Delete local temp file
        fs.unlinkSync(file.path);
      }

      // Handle gallery files (Base64)
      const gallery = [];
      if (req.files && req.files.gallery) {
        req.files.gallery.forEach(file => {
          const base64Str = fileToBase64(file);
          if (base64Str) gallery.push(base64Str);
          // Delete local temp file
          fs.unlinkSync(file.path);
        });
      }

      // Handle video file (ephemeral local) or external link (recommended)
      let promoVideo = { type: 'external', url: '' };
      const videoFile = (req.files && req.files.video && req.files.video[0]) || (req.files && req.files.promoVideoFile && req.files.promoVideoFile[0]);
      if (videoFile) {
        promoVideo = {
          type: 'local',
          url: `/uploads/${videoFile.filename}`
        };
      } else if (req.body.promoVideo) {
        try {
          promoVideo = typeof req.body.promoVideo === 'string' ? JSON.parse(req.body.promoVideo) : req.body.promoVideo;
        } catch (e) {
          promoVideo = { type: 'external', url: req.body.promoVideo };
        }
      } else if (req.body.promoVideoUrl) {
        promoVideo = {
          type: 'external',
          url: req.body.promoVideoUrl
        };
      }

      const player = await playerService.create({
        name,
        rank: parseInt(rank, 10),
        playingStyle,
        playingHand,
        biography,
        country,
        achievements,
        avatarUrl,
        equipment,
        promoVideo,
        gallery
      });

      res.status(201).json(player);
    } catch (err) {
      // Clean up local temp files on error
      if (req.files) {
        if (req.files.avatar && req.files.avatar[0]) fs.unlink(req.files.avatar[0].path, () => {});
        if (req.files.video && req.files.video[0]) fs.unlink(req.files.video[0].path, () => {});
        if (req.files.gallery) {
          req.files.gallery.forEach(f => fs.unlink(f.path, () => {}));
        }
      }
      next(err);
    }
  },

  async updatePlayer(req, res, next) {
    try {
      const { id } = req.params;
      const existingPlayer = await playerService.getById(id);
      if (!existingPlayer) {
        return res.status(404).json({ message: 'Player not found' });
      }

      const updates = {};
      const fields = ['name', 'rank', 'playingStyle', 'playingHand', 'biography', 'country'];
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (updates.rank) {
        updates.rank = parseInt(updates.rank, 10);
      }

      // Parse JSON sub-objects
      if (req.body.equipment) {
        try {
          updates.equipment = typeof req.body.equipment === 'string' ? JSON.parse(req.body.equipment) : req.body.equipment;
        } catch (e) {
          return res.status(400).json({ message: 'Invalid equipment structure' });
        }
      }

      if (req.body.achievements) {
        try {
          updates.achievements = typeof req.body.achievements === 'string' ? JSON.parse(req.body.achievements) : req.body.achievements;
        } catch (e) {
          // Fallback
        }
      }

      // Handle avatar file (Base64)
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        const file = req.files.avatar[0];
        // Delete old local avatar if it was stored on disk
        if (existingPlayer.avatarUrl && existingPlayer.avatarUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingPlayer.avatarUrl);
        }
        updates.avatarUrl = fileToBase64(file);
        fs.unlinkSync(file.path);
      } else if (req.body.deleteAvatar === 'true') {
        if (existingPlayer.avatarUrl && existingPlayer.avatarUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingPlayer.avatarUrl);
        }
        updates.avatarUrl = '';
      }

      // Handle gallery updates
      let finalGallery = existingPlayer.gallery ? [...existingPlayer.gallery] : [];
      const galleryPayload = req.body.existingGallery || req.body.galleryList;
      if (galleryPayload) {
        try {
          const clientGallery = typeof galleryPayload === 'string' ? JSON.parse(galleryPayload) : galleryPayload;
          const deletedFiles = finalGallery.filter(file => !clientGallery.includes(file));
          deletedFiles.forEach(file => {
            if (file.startsWith('/uploads/')) deleteLocalFile(file);
          });
          finalGallery = clientGallery;
        } catch (e) {
          // ignore parsing error
        }
      }

      // Append new gallery uploads (Base64)
      if (req.files && req.files.gallery) {
        req.files.gallery.forEach(file => {
          const base64Str = fileToBase64(file);
          if (base64Str) finalGallery.push(base64Str);
          fs.unlinkSync(file.path);
        });
      }
      updates.gallery = finalGallery;

      // Handle video updates (local/external)
      const videoFile = (req.files && req.files.video && req.files.video[0]) || (req.files && req.files.promoVideoFile && req.files.promoVideoFile[0]);
      if (videoFile) {
        if (existingPlayer.promoVideo && existingPlayer.promoVideo.type === 'local') {
          deleteLocalFile(existingPlayer.promoVideo.url);
        }
        updates.promoVideo = {
          type: 'local',
          url: `/uploads/${videoFile.filename}`
        };
      } else if (req.body.promoVideo) {
        try {
          const pv = typeof req.body.promoVideo === 'string' ? JSON.parse(req.body.promoVideo) : req.body.promoVideo;
          if (existingPlayer.promoVideo && existingPlayer.promoVideo.type === 'local' && pv.url !== existingPlayer.promoVideo.url) {
            deleteLocalFile(existingPlayer.promoVideo.url);
          }
          updates.promoVideo = pv;
        } catch (e) {
          updates.promoVideo = { type: 'external', url: req.body.promoVideo };
        }
      } else if (req.body.promoVideoUrl !== undefined) {
        if (existingPlayer.promoVideo && existingPlayer.promoVideo.type === 'local' && req.body.promoVideoUrl !== existingPlayer.promoVideo.url) {
          deleteLocalFile(existingPlayer.promoVideo.url);
        }
        updates.promoVideo = {
          type: 'external',
          url: req.body.promoVideoUrl
        };
      } else if (req.body.deleteVideo === 'true') {
        if (existingPlayer.promoVideo && existingPlayer.promoVideo.type === 'local') {
          deleteLocalFile(existingPlayer.promoVideo.url);
        }
        updates.promoVideo = { type: 'external', url: '' };
      }

      const updatedPlayer = await playerService.update(id, updates);
      res.json(updatedPlayer);
    } catch (err) {
      if (req.files) {
        if (req.files.avatar && req.files.avatar[0]) fs.unlink(req.files.avatar[0].path, () => {});
        if (req.files.video && req.files.video[0]) fs.unlink(req.files.video[0].path, () => {});
        if (req.files.gallery) {
          req.files.gallery.forEach(f => fs.unlink(f.path, () => {}));
        }
      }
      next(err);
    }
  },

  async deletePlayer(req, res, next) {
    try {
      const { id } = req.params;
      const player = await playerService.getById(id);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }

      // Delete local files associated with the player (if any)
      if (player.avatarUrl && player.avatarUrl.startsWith('/uploads/')) deleteLocalFile(player.avatarUrl);
      if (player.promoVideo && player.promoVideo.type === 'local') deleteLocalFile(player.promoVideo.url);
      if (player.gallery) {
        player.gallery.forEach(file => {
          if (file.startsWith('/uploads/')) deleteLocalFile(file);
        });
      }

      await playerService.delete(id);
      res.json({ message: 'Player profile and media successfully deleted.' });
    } catch (err) {
      next(err);
    }
  }
};
