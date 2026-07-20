const Settings = require('../models/Settings');
const dbConfig = require('../config/db');

module.exports = {
  async getSettings() {
    if (dbConfig.isMongoConnected()) {
      let settings = await Settings.findOne({});
      if (!settings) {
        settings = new Settings();
        await settings.save();
      }
      return settings;
    } else {
      const data = dbConfig.getLocalData();
      if (!data.settings) {
        data.settings = {
          websiteName: 'Championship Table Tennis Club',
          logoUrl: '',
          bannerUrl: '',
          aboutContent: 'Welcome to our premier table tennis showcase...',
          contactEmail: 'info@championshiptt.com',
          contactPhone: '+1 (555) 123-4567',
          location: '123 Ping Pong Way, Sports City',
          socialLinks: { facebook: '', instagram: '', youtube: '' },
          footerText: '© 2026 Championship Table Tennis Club. All rights reserved.'
        };
        dbConfig.saveLocalData(data);
      }
      return data.settings;
    }
  },

  async updateSettings(settingsData) {
    if (dbConfig.isMongoConnected()) {
      let settings = await Settings.findOne({});
      if (!settings) {
        settings = new Settings(settingsData);
      } else {
        Object.assign(settings, settingsData);
      }
      return await settings.save();
    } else {
      const data = dbConfig.getLocalData();
      data.settings = {
        ...data.settings,
        ...settingsData,
        socialLinks: {
          ...data.settings?.socialLinks,
          ...settingsData?.socialLinks
        }
      };
      dbConfig.saveLocalData(data);
      return data.settings;
    }
  }
};
