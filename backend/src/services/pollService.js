const { supabase, isSupabaseConfigured } = require('../config/supabase');
const playerService = require('./playerService');
const dbConfig = require('../config/db');

module.exports = {
  async getPollSettings() {
    const defaultSettings = {
      active: false,
      endsAt: null,
      published: false,
      pollId: 'default'
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('social_links')
          .eq('id', 'poll_settings')
          .maybeSingle();

        if (!error && data && data.social_links) {
          return {
            active: !!data.social_links.active,
            endsAt: data.social_links.endsAt || null,
            published: !!data.social_links.published,
            pollId: data.social_links.pollId || 'default'
          };
        }
      } catch (err) {
        console.error("Supabase getPollSettings failed:", err.message);
      }
    }

    // Fallbacks
    if (dbConfig.isMongoConnected()) {
      // We can reuse the Mongoose settings model or a simple key
      const Settings = require('../models/Settings');
      const settings = await Settings.findOne({});
      if (settings && settings.socialLinks && settings.socialLinks.facebook === 'poll_settings') {
        // we can store it in database
      }
      // Let's use a local fallback variable or db.json
    }

    const data = dbConfig.getLocalData();
    return data.pollSettings || defaultSettings;
  },

  async updatePollSettings(pollData) {
    const currentSettings = await this.getPollSettings();
    const cleanData = {
      active: !!pollData.active,
      endsAt: pollData.endsAt || null,
      published: !!pollData.published,
      pollId: pollData.pollId || currentSettings.pollId
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('settings')
          .upsert([{ id: 'poll_settings', social_links: cleanData }]);
      } catch (err) {
        console.error("Supabase updatePollSettings notice:", err.message);
      }
    }

    const data = dbConfig.getLocalData();
    data.pollSettings = cleanData;
    dbConfig.saveLocalData(data);

    return cleanData;
  },

  async resetPoll() {
    // Clear votes
    await playerService.resetVotes();
    
    // Generate new poll ID and set it inactive by default, preserving other settings or just resetting to defaults.
    const newPollId = Date.now().toString();
    const resetData = {
      active: false,
      endsAt: null,
      published: false,
      pollId: newPollId
    };
    
    return await this.updatePollSettings(resetData);
  },

  async vote(playerId) {
    const settings = await this.getPollSettings();
    if (!settings.active) {
      throw new Error("Voting is currently closed.");
    }

    // Check expiration timer
    if (settings.endsAt) {
      const now = new Date();
      const expiration = new Date(settings.endsAt);
      if (now > expiration) {
        // Auto-disable the poll
        settings.active = false;
        await this.updatePollSettings(settings);
        throw new Error("Voting session has expired.");
      }
    }

    const player = await playerService.getById(playerId);
    if (!player) {
      throw new Error("Player not found.");
    }

    // Increment votes
    return await playerService.incrementVote(playerId);
  }
};
