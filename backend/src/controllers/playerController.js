const fs = require('fs');
const path = require('path');
const playerService = require('../services/playerService');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

async function uploadFileToSupabase(file, fileName) {
  const fileData = file.buffer || fs.readFileSync(file.path);
  const { error } = await supabase.storage
    .from('showcase-media')
    .upload(fileName, fileData, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    console.error("Supabase storage upload error:", error.message);
    return '';
  }

  const { data: publicUrlData } = supabase.storage
    .from('showcase-media')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Uploads the full-size file and, if a pre-compressed thumbnail was sent
// alongside it, a companion thumb using the SAME base filename prefixed with
// "thumb-". This lets the frontend derive a thumbnail URL from the full URL
// by string manipulation alone — no extra DB column/migration needed, and
// old records without a thumb counterpart just fall back to the full image.
async function uploadToSupabase(file, folder = 'uploads', thumbFile = null) {
  if (!file) return '';
  if (!isSupabaseConfigured()) return '';

  try {
    const fileExt = path.extname(file.originalname);
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileName = `${folder}/${suffix}${fileExt}`;

    const url = await uploadFileToSupabase(file, fileName);
    if (!url) return '';

    if (thumbFile) {
      try {
        const thumbExt = path.extname(thumbFile.originalname) || fileExt;
        await uploadFileToSupabase(thumbFile, `${folder}/thumb-${suffix}${thumbExt}`);
      } catch (thumbErr) {
        // Thumbnail is an optimization, not required — full image still works.
        console.error("Error uploading thumbnail to Supabase:", thumbErr);
      }
    }

    return url;
  } catch (err) {
    console.error("Error uploading to Supabase:", err);
    return '';
  }
}

// Helper to convert uploaded files to Base64 strings (fallback)
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

async function processFile(file, folder = 'media', thumbFile = null) {
  if (!file) return '';
  if (isSupabaseConfigured()) {
    return await uploadToSupabase(file, folder, thumbFile);
  }
  return fileToBase64(file);
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
      const { page, limit, search, style } = req.query;
      const result = await playerService.getAll(page, limit, search, style);
      res.json(result);
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
      // Single pass — avoids calling getAll() three separate times
      const stats = await playerService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async createPlayer(req, res, next) {
    try {
      const { name, email, rank, playingStyle, playingHand, biography, country } = req.body;
      
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
        const file = req.files.avatar[0];
        const thumbFile = req.files.avatarThumb && req.files.avatarThumb[0];
        avatarUrl = await processFile(file, 'avatars', thumbFile);
        // Delete local temp files
        if (file.path) fs.unlinkSync(file.path);
        if (thumbFile && thumbFile.path) fs.unlinkSync(thumbFile.path);
      }

      // Handle gallery files (thumbs are paired with full files by index)
      const gallery = [];
      if (req.files && req.files.gallery) {
        const thumbs = req.files.galleryThumbs || [];
        for (let i = 0; i < req.files.gallery.length; i++) {
          const file = req.files.gallery[i];
          const thumbFile = thumbs[i];
          const url = await processFile(file, 'gallery', thumbFile);
          if (url) gallery.push(url);
          // Delete local temp files
          if (file.path) fs.unlinkSync(file.path);
          if (thumbFile && thumbFile.path) fs.unlinkSync(thumbFile.path);
        }
      }

      // Handle video file
      let promoVideo = { type: 'external', url: '' };
      const videoFile = (req.files && req.files.video && req.files.video[0]) || (req.files && req.files.promoVideoFile && req.files.promoVideoFile[0]);
      if (videoFile) {
        const videoUrl = await processFile(videoFile, 'videos');
        if (videoFile.path) fs.unlinkSync(videoFile.path);
        promoVideo = {
          type: isSupabaseConfigured() ? 'supabase' : 'base64',
          url: videoUrl
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
        email,
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
        if (req.files.avatar && req.files.avatar[0]) if (req.files.avatar[0].path) fs.unlink(req.files.avatar[0].path, () => {});
        if (req.files.video && req.files.video[0]) if (req.files.video[0].path) fs.unlink(req.files.video[0].path, () => {});
        if (req.files.gallery) {
          req.files.gallery.forEach(f => { if (f.path) fs.unlink(f.path, () => {}); });
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
      const fields = ['name', 'email', 'rank', 'playingStyle', 'playingHand', 'biography', 'country'];
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
        const file = req.files.avatar[0];
        const thumbFile = req.files.avatarThumb && req.files.avatarThumb[0];
        // Delete old local avatar if it was stored on disk
        if (existingPlayer.avatarUrl && existingPlayer.avatarUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingPlayer.avatarUrl);
        }
        updates.avatarUrl = await processFile(file, 'avatars', thumbFile);
        if (file.path) fs.unlinkSync(file.path);
        if (thumbFile && thumbFile.path) fs.unlinkSync(thumbFile.path);
      } else if (req.body.deleteAvatar === 'true') {
        if (existingPlayer.avatarUrl && existingPlayer.avatarUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingPlayer.avatarUrl);
        }
        updates.avatarUrl = '';
      }

      // Handle gallery updates
      let finalGallery = existingPlayer.gallery ? [...existingPlayer.gallery] : [];
      
      if (req.body.keptGalleryIndexes) {
        try {
          const keptIndexes = typeof req.body.keptGalleryIndexes === 'string' ? JSON.parse(req.body.keptGalleryIndexes) : req.body.keptGalleryIndexes;
          const keptFiles = [];
          finalGallery.forEach((file, index) => {
            if (keptIndexes.includes(index)) {
              keptFiles.push(file);
            } else if (file.startsWith('/uploads/')) {
              deleteLocalFile(file);
            }
          });
          finalGallery = keptFiles;
        } catch (e) {}
      } else {
        const galleryPayload = req.body.existingGallery || req.body.galleryList;
        if (galleryPayload) {
          try {
            const clientGallery = typeof galleryPayload === 'string' ? JSON.parse(galleryPayload) : galleryPayload;
            const deletedFiles = finalGallery.filter(file => !clientGallery.includes(file));
            deletedFiles.forEach(file => {
              if (file.startsWith('/uploads/')) deleteLocalFile(file);
            });
            finalGallery = clientGallery;
          } catch (e) {}
        }
      }

      // Append new gallery uploads (thumbs paired with full files by index)
      if (req.files && req.files.gallery) {
        const thumbs = req.files.galleryThumbs || [];
        for (let i = 0; i < req.files.gallery.length; i++) {
          const file = req.files.gallery[i];
          const thumbFile = thumbs[i];
          const url = await processFile(file, 'gallery', thumbFile);
          if (url) finalGallery.push(url);
          if (file.path) fs.unlinkSync(file.path);
          if (thumbFile && thumbFile.path) fs.unlinkSync(thumbFile.path);
        }
      }
      updates.gallery = finalGallery;

      // Handle video updates
      const videoFile = (req.files && req.files.video && req.files.video[0]) || (req.files && req.files.promoVideoFile && req.files.promoVideoFile[0]);
      if (videoFile) {
        const videoUrl = await processFile(videoFile, 'videos');
        if (videoFile.path) fs.unlinkSync(videoFile.path);
        updates.promoVideo = {
          type: isSupabaseConfigured() ? 'supabase' : 'base64',
          url: videoUrl
        };
      } else if (req.body.promoVideo) {
        try {
          const pv = typeof req.body.promoVideo === 'string' ? JSON.parse(req.body.promoVideo) : req.body.promoVideo;
          updates.promoVideo = pv;
        } catch (e) {
          updates.promoVideo = { type: 'external', url: req.body.promoVideo };
        }
      } else if (req.body.promoVideoUrl !== undefined) {
        updates.promoVideo = {
          type: 'external',
          url: req.body.promoVideoUrl
        };
      } else if (req.body.deleteVideo === 'true') {
        updates.promoVideo = { type: 'external', url: '' };
      }

      const updatedPlayer = await playerService.update(id, updates);
      res.json(updatedPlayer);
    } catch (err) {
      if (req.files) {
        if (req.files.avatar && req.files.avatar[0]) if (req.files.avatar[0].path) fs.unlink(req.files.avatar[0].path, () => {});
        if (req.files.video && req.files.video[0]) if (req.files.video[0].path) fs.unlink(req.files.video[0].path, () => {});
        if (req.files.gallery) {
          req.files.gallery.forEach(f => { if (f.path) fs.unlink(f.path, () => {}); });
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
