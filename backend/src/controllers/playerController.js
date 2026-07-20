const fs = require('fs');
const path = require('path');
const playerService = require('../services/playerService');

// Helper to delete local uploads
function deleteLocalFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  
  const filename = fileUrl.replace('/uploads/', '');
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error(`Error deleting file: ${filePath}`, unlinkErr);
        else console.log(`Deleted orphaned upload: ${filePath}`);
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

      // Handle avatar file
      let avatarUrl = '';
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      }

      // Handle gallery files
      const gallery = [];
      if (req.files && req.files.gallery) {
        req.files.gallery.forEach(file => {
          gallery.push(`/uploads/${file.filename}`);
        });
      }

      // Handle video file or external link
      let promoVideo = { type: 'external', url: '' };
      if (req.files && req.files.video && req.files.video[0]) {
        promoVideo = {
          type: 'local',
          url: `/uploads/${req.files.video[0].filename}`
        };
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
      // Clean up uploaded files in case of error
      if (req.files) {
        if (req.files.avatar && req.files.avatar[0]) deleteLocalFile(`/uploads/${req.files.avatar[0].filename}`);
        if (req.files.video && req.files.video[0]) deleteLocalFile(`/uploads/${req.files.video[0].filename}`);
        if (req.files.gallery) {
          req.files.gallery.forEach(f => deleteLocalFile(`/uploads/${f.filename}`));
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

      // Handle avatar file
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        // Delete old avatar
        if (existingPlayer.avatarUrl) {
          deleteLocalFile(existingPlayer.avatarUrl);
        }
        updates.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      } else if (req.body.deleteAvatar === 'true') {
        if (existingPlayer.avatarUrl) {
          deleteLocalFile(existingPlayer.avatarUrl);
        }
        updates.avatarUrl = '';
      }

      // Handle gallery updates
      let finalGallery = existingPlayer.gallery ? [...existingPlayer.gallery] : [];
      
      // If client provides a modified gallery order or deletes items:
      if (req.body.galleryList) {
        try {
          const clientGallery = typeof req.body.galleryList === 'string' ? JSON.parse(req.body.galleryList) : req.body.galleryList;
          // Find deleted items to clean up storage
          const deletedFiles = finalGallery.filter(file => !clientGallery.includes(file));
          deletedFiles.forEach(file => deleteLocalFile(file));
          finalGallery = clientGallery;
        } catch (e) {
          // ignore parsing error
        }
      }

      // Append new gallery uploads
      if (req.files && req.files.gallery) {
        req.files.gallery.forEach(file => {
          finalGallery.push(`/uploads/${file.filename}`);
        });
      }
      updates.gallery = finalGallery;

      // Handle video updates
      if (req.files && req.files.video && req.files.video[0]) {
        // Delete old video if local
        if (existingPlayer.promoVideo && existingPlayer.promoVideo.type === 'local') {
          deleteLocalFile(existingPlayer.promoVideo.url);
        }
        updates.promoVideo = {
          type: 'local',
          url: `/uploads/${req.files.video[0].filename}`
        };
      } else if (req.body.promoVideoUrl !== undefined) {
        // If updating external link, delete old local video if existed
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
        if (req.files.avatar && req.files.avatar[0]) deleteLocalFile(`/uploads/${req.files.avatar[0].filename}`);
        if (req.files.video && req.files.video[0]) deleteLocalFile(`/uploads/${req.files.video[0].filename}`);
        if (req.files.gallery) {
          req.files.gallery.forEach(f => deleteLocalFile(`/uploads/${f.filename}`));
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

      // Delete files associated with the player
      if (player.avatarUrl) deleteLocalFile(player.avatarUrl);
      if (player.promoVideo && player.promoVideo.type === 'local') deleteLocalFile(player.promoVideo.url);
      if (player.gallery) {
        player.gallery.forEach(file => deleteLocalFile(file));
      }

      await playerService.delete(id);
      res.json({ message: 'Player profile and media successfully deleted.' });
    } catch (err) {
      next(err);
    }
  }
};
