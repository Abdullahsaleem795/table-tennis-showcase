const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    default: 'Championship Table Tennis Club'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  bannerUrl: {
    type: String,
    default: ''
  },
  aboutContent: {
    type: String,
    default: 'Welcome to our premier table tennis showcase. We feature elite table tennis players, highlighting their rankings, specialized equipment, styles, and training footage.'
  },
  contactEmail: {
    type: String,
    default: 'info@championshiptt.com'
  },
  contactPhone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  location: {
    type: String,
    default: '123 Ping Pong Way, Sports City'
  },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com' },
    instagram: { type: String, default: 'https://instagram.com' },
    youtube: { type: String, default: 'https://youtube.com' }
  },
  footerText: {
    type: String,
    default: '© 2026 Championship Table Tennis Club. All rights reserved.'
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
