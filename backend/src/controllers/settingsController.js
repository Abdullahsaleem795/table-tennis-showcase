const fs = require('fs');
const path = require('path');
const settingsService = require('../services/settingsService');

function deleteLocalFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const filename = fileUrl.replace('/uploads/', '');
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error(`Error deleting settings file: ${filePath}`, unlinkErr);
      });
    }
  });
}

module.exports = {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettings();
      res.json(settings);
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const existingSettings = await settingsService.getSettings();
      const updates = { ...req.body };

      // Parse nested objects if sent as strings (multipart/form-data)
      if (typeof updates.socialLinks === 'string') {
        try {
          updates.socialLinks = JSON.parse(updates.socialLinks);
        } catch (e) {
          delete updates.socialLinks;
        }
      }

      // Handle logo upload
      if (req.files && req.files.logo && req.files.logo[0]) {
        if (existingSettings.logoUrl) {
          deleteLocalFile(existingSettings.logoUrl);
        }
        updates.logoUrl = `/uploads/${req.files.logo[0].filename}`;
      } else if (req.body.deleteLogo === 'true') {
        if (existingSettings.logoUrl) deleteLocalFile(existingSettings.logoUrl);
        updates.logoUrl = '';
      }

      // Handle banner upload
      if (req.files && req.files.banner && req.files.banner[0]) {
        if (existingSettings.bannerUrl) {
          deleteLocalFile(existingSettings.bannerUrl);
        }
        updates.bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      } else if (req.body.deleteBanner === 'true') {
        if (existingSettings.bannerUrl) deleteLocalFile(existingSettings.bannerUrl);
        updates.bannerUrl = '';
      }

      const updated = await settingsService.updateSettings(updates);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
};
