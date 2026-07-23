const fs = require('fs');
const path = require('path');
const settingsService = require('../services/settingsService');

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

      // Handle logo upload (Base64)
      if (req.files && req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        if (existingSettings.logoUrl && existingSettings.logoUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingSettings.logoUrl);
        }
        updates.logoUrl = fileToBase64(file);
        if (file.path) fs.unlinkSync(file.path);
      } else if (req.body.deleteLogo === 'true') {
        if (existingSettings.logoUrl && existingSettings.logoUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingSettings.logoUrl);
        }
        updates.logoUrl = '';
      }

      // Handle banner upload (Base64)
      if (req.files && req.files.banner && req.files.banner[0]) {
        const file = req.files.banner[0];
        if (existingSettings.bannerUrl && existingSettings.bannerUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingSettings.bannerUrl);
        }
        updates.bannerUrl = fileToBase64(file);
        if (file.path) fs.unlinkSync(file.path);
      } else if (req.body.deleteBanner === 'true') {
        if (existingSettings.bannerUrl && existingSettings.bannerUrl.startsWith('/uploads/')) {
          deleteLocalFile(existingSettings.bannerUrl);
        }
        updates.bannerUrl = '';
      }

      const updated = await settingsService.updateSettings(updates);
      res.json(updated);
    } catch (err) {
      if (req.files) {
        if (req.files.logo && req.files.logo[0]) if (req.files.logo[0].path) fs.unlink(req.files.logo[0].path, () => {});
        if (req.files.banner && req.files.banner[0]) if (req.files.banner[0].path) fs.unlink(req.files.banner[0].path, () => {});
      }
      next(err);
    }
  }
};
