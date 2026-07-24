const { supabase, isSupabaseConfigured } = require('../config/supabase');
const Settings = require('../models/Settings');
const dbConfig = require('../config/db');

function formatSettings(s) {
  if (!s) return null;
  return {
    websiteName: s.website_name || s.websiteName || 'Table Tennis Today',
    logoUrl: s.logo_url || s.logoUrl || '',
    bannerUrl: s.banner_url || s.bannerUrl || '',
    aboutContent: s.about_content || s.aboutContent || 'Welcome to our premier table tennis showcase. We feature elite table tennis players, highlighting their rankings, specialized equipment, styles, and training footage.',
    contactEmail: s.contact_email || s.contactEmail || 'info@championshiptt.com',
    contactPhone: s.contact_phone || s.contactPhone || '+1 (555) 123-4567',
    location: s.location || '123 Ping Pong Way, Sports City',
    socialLinks: s.social_links || s.socialLinks || { facebook: 'https://facebook.com', instagram: 'https://instagram.com', youtube: 'https://youtube.com' },
    footerText: s.footer_text || s.footerText || '© 2026 Table Tennis Today. All rights reserved.'
  };
}

module.exports = {
  async getSettings() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'global_settings')
          .maybeSingle();

        if (!error && data) return formatSettings(data);
      } catch (err) {
        console.error("Supabase getSettings failed:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      let settings = await Settings.findOne({});
      if (!settings) {
        settings = new Settings();
        await settings.save();
      }
      return formatSettings(settings);
    } else {
      const data = dbConfig.getLocalData();
      return formatSettings(data.settings);
    }
  },

  async updateSettings(settingsData) {
    if (isSupabaseConfigured()) {
      try {
        const payload = {
          id: 'global_settings',
          website_name: settingsData.websiteName,
          logo_url: settingsData.logoUrl,
          banner_url: settingsData.bannerUrl,
          about_content: settingsData.aboutContent,
          contact_email: settingsData.contactEmail,
          contact_phone: settingsData.contactPhone,
          location: settingsData.location,
          social_links: settingsData.socialLinks,
          footer_text: settingsData.footerText
        };

        // Remove undefined fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        // Fetch existing to merge
        const { data: existing } = await supabase.from('settings').select('*').eq('id', 'global_settings').maybeSingle();
        const mergedPayload = { ...existing, ...payload };

        const { data, error } = await supabase
          .from('settings')
          .upsert([mergedPayload])
          .select()
          .single();

        if (!error && data) return formatSettings(data);
      } catch (err) {
        console.error("Supabase updateSettings error:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      let settings = await Settings.findOne({});
      if (!settings) {
        settings = new Settings(settingsData);
      } else {
        Object.assign(settings, settingsData);
      }
      const saved = await settings.save();
      return formatSettings(saved);
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
      return formatSettings(data.settings);
    }
  }
};
