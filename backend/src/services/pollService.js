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

  async getVotedIps() {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('settings').select('social_links').eq('id', 'poll_voters').maybeSingle();
        if (data && data.social_links && Array.isArray(data.social_links)) return data.social_links;
      } catch (e) {}
    }
    const local = dbConfig.getLocalData();
    return local.pollVoters || [];
  },

  async addVotedIp(ip) {
    const ips = await this.getVotedIps();
    if (!ips.includes(ip)) {
      ips.push(ip);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('settings').upsert([{ id: 'poll_voters', social_links: ips }]);
        } catch (e) {}
      }
      const local = dbConfig.getLocalData();
      local.pollVoters = ips;
      dbConfig.saveLocalData(local);
    }
  },

  async resetPoll() {
    // Clear votes
    await playerService.resetVotes();
    
    // Clear voted IPs
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('settings').upsert([{ id: 'poll_voters', social_links: [] }]);
      } catch (e) {}
    }
    const local = dbConfig.getLocalData();
    local.pollVoters = [];
    dbConfig.saveLocalData(local);

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

  async vote(playerId, ip) {
    const settings = await this.getPollSettings();
    if (!settings.active) {
      throw new Error("Voting is currently closed.");
    }

    if (ip) {
      const votedIps = await this.getVotedIps();
      if (votedIps.includes(ip)) {
        throw new Error("You have already voted in this poll.");
      }
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
    const result = await playerService.incrementVote(playerId);
    
    // Track IP
    if (ip) {
      await this.addVotedIp(ip);
    }
    
    return result;
  }
};
