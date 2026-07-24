const { supabase, isSupabaseConfigured } = require('../config/supabase');
const Player = require('../models/Player');
const dbConfig = require('../config/db');

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// ─── In-memory votes cache ────────────────────────────────────────────────────
// Avoids a Supabase round-trip on every getAll() / getById() call
let _votesCache = null;
let _votesCacheTs = 0;
const VOTES_CACHE_TTL_MS = 30_000; // 30 seconds

async function getVotesMap() {
  const now = Date.now();
  if (_votesCache && now - _votesCacheTs < VOTES_CACHE_TTL_MS) {
    return _votesCache;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('social_links')
        .eq('id', 'poll_votes')
        .maybeSingle();

      if (!error && data && data.social_links) {
        _votesCache = data.social_links || {};
        _votesCacheTs = now;
        return _votesCache;
      }
    } catch (err) {
      console.error('Supabase getVotesMap failed:', err.message);
    }
  }

  const data = dbConfig.getLocalData();
  _votesCache = data.pollVotes || {};
  _votesCacheTs = now;
  return _votesCache;
}

function invalidateVotesCache() {
  _votesCache = null;
  _votesCacheTs = 0;
}

async function saveVotesMap(votesMap) {
  invalidateVotesCache();

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('settings')
        .upsert([{ id: 'poll_votes', social_links: votesMap }]);
    } catch (err) {
      console.error('Supabase saveVotesMap failed:', err.message);
    }
  }

  const data = dbConfig.getLocalData();
  data.pollVotes = votesMap;
  dbConfig.saveLocalData(data);
}

function formatPlayer(p, votes = 0) {
  if (!p) return null;
  return {
    _id: p.id || p._id,
    id: p.id || p._id,
    name: p.name,
    email: p.email || '',
    rank: p.rank,
    playingStyle: p.playing_style || p.playingStyle || 'Attack',
    playingHand: p.playing_hand || p.playingHand || 'Right Hand',
    biography: p.biography || '',
    country: p.country || '',
    achievements: p.achievements || [],
    avatarUrl: p.avatar_url || p.avatarUrl || '',
    equipment: p.equipment || {
      blade: { brand: '', model: '' },
      forehandRubber: { brand: '', model: '', spongeThickness: '', speed: 0, spin: 0 },
      backhandRubber: { brand: '', model: '', spongeThickness: '', speed: 0, spin: 0 }
    },
    promoVideo: p.promo_video || p.promoVideo || { type: 'external', url: '' },
    gallery: p.gallery || [],
    votes: votes,
    createdAt: p.created_at || p.createdAt || new Date().toISOString()
  };
}

// ─── OPTIMIZED rank conflict resolution ──────────────────────────────────────
// OLD: Sequential loop → N Supabase round-trips (one per player)
// NEW: Single batch upsert → 1 Supabase round-trip regardless of player count
async function resolveRankConflicts(targetRank, targetPlayerId = null) {
  targetRank = parseInt(targetRank, 10);
  if (isNaN(targetRank) || targetRank < 1) targetRank = 1;

  if (isSupabaseConfigured()) {
    try {
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, rank')
        .order('rank', { ascending: true });

      if (!allPlayers) return;

      const otherPlayers = allPlayers.filter(p => p.id !== targetPlayerId);
      const conflict = otherPlayers.some(p => p.rank === targetRank);

      if (conflict) {
        // Build a batch of all rank shifts needed in one go
        const toUpdate = otherPlayers
          .filter(p => p.rank >= targetRank)
          .map(p => ({ id: p.id, rank: p.rank + 1 }));

        if (toUpdate.length > 0) {
          // Single upsert call instead of N individual updates
          await supabase.from('players').upsert(toUpdate, { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.error('Supabase rank resolution notice:', e.message);
    }
  } else if (dbConfig.isMongoConnected()) {
    const query = { rank: targetRank };
    if (targetPlayerId) query._id = { $ne: targetPlayerId };
    const conflict = await Player.findOne(query);
    if (conflict) {
      if (targetPlayerId) await Player.findByIdAndUpdate(targetPlayerId, { rank: 999999 });
      const gteQuery = { rank: { $gte: targetRank } };
      if (targetPlayerId) gteQuery._id = { $ne: targetPlayerId };
      // Mongo bulk write — single operation
      await Player.updateMany(gteQuery, { $inc: { rank: 1 } });
    }
  } else {
    const data = dbConfig.getLocalData();
    const players = data.players;
    const conflict = players.find(p => (p._id !== targetPlayerId && p.id !== targetPlayerId) && p.rank === targetRank);
    if (conflict) {
      players.forEach(p => {
        const pId = p._id || p.id;
        if (pId !== targetPlayerId && p.rank >= targetRank) {
          p.rank = p.rank + 1;
        }
      });
      dbConfig.saveLocalData(data);
    }
  }
}

module.exports = {
  async getAll() {
    // Fetch votes and players in parallel — saves one round-trip
    const [votesMap, playersResult] = await Promise.all([
      getVotesMap(),
      isSupabaseConfigured()
        ? supabase.from('players').select('*').order('rank', { ascending: true })
        : Promise.resolve(null)
    ]);

    if (isSupabaseConfigured() && playersResult) {
      const { data, error } = playersResult;
      if (!error && data) {
        return data.map(p => formatPlayer(p, votesMap[p.id] || 0));
      }
    }

    if (dbConfig.isMongoConnected()) {
      const players = await Player.find({}).sort({ rank: 1 });
      return players.map(p => formatPlayer(p, votesMap[p._id || p.id] || 0));
    } else {
      const data = dbConfig.getLocalData();
      const players = [...data.players];
      players.sort((a, b) => a.rank - b.rank);
      return players.map(p => formatPlayer(p, votesMap[p._id || p.id] || 0));
    }
  },

  async getById(id) {
    const votesMap = await getVotesMap();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) return formatPlayer(data, votesMap[id] || 0);
      } catch (err) {
        console.error('Supabase getById failed:', err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      const p = await Player.findById(id);
      return formatPlayer(p, votesMap[id] || 0);
    } else {
      const data = dbConfig.getLocalData();
      const p = data.players.find(x => x._id === id || x.id === id);
      return formatPlayer(p, votesMap[id] || 0);
    }
  },

  async create(playerData) {
    await resolveRankConflicts(playerData.rank);
    const newId = generateId();

    if (isSupabaseConfigured()) {
      try {
        const payload = {
          id: newId,
          name: playerData.name,
          rank: parseInt(playerData.rank, 10),
          playing_style: playerData.playingStyle,
          playing_hand: playerData.playingHand,
          biography: playerData.biography || '',
          country: playerData.country || '',
          achievements: playerData.achievements || [],
          avatar_url: playerData.avatarUrl || '',
          equipment: playerData.equipment || {},
          promo_video: playerData.promoVideo || { type: 'external', url: '' },
          gallery: playerData.gallery || [],
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('players')
          .insert([payload])
          .select()
          .single();

        if (!error && data) return formatPlayer(data, 0);
        if (error) console.error('Supabase player insert notice:', error.message);
      } catch (err) {
        console.error('Supabase create player error:', err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      const newPlayer = new Player(playerData);
      const saved = await newPlayer.save();
      return formatPlayer(saved, 0);
    } else {
      const data = dbConfig.getLocalData();
      const newPlayer = {
        _id: newId,
        id: newId,
        name: playerData.name,
        email: playerData.email || '',
        rank: parseInt(playerData.rank, 10),
        playingStyle: playerData.playingStyle,
        playingHand: playerData.playingHand,
        biography: playerData.biography || '',
        country: playerData.country || '',
        achievements: playerData.achievements || [],
        avatarUrl: playerData.avatarUrl || '',
        equipment: playerData.equipment || {},
        promoVideo: playerData.promoVideo || { type: 'external', url: '' },
        gallery: playerData.gallery || [],
        createdAt: new Date().toISOString()
      };
      data.players.push(newPlayer);
      dbConfig.saveLocalData(data);
      return formatPlayer(newPlayer, 0);
    }
  },

  async update(id, playerData) {
    if (playerData.rank !== undefined) {
      playerData.rank = parseInt(playerData.rank, 10);
      if (!isNaN(playerData.rank)) {
        await resolveRankConflicts(playerData.rank, id);
      }
    }

    const votesMap = await getVotesMap();

    if (isSupabaseConfigured()) {
      try {
        const payload = {};
        if (playerData.name !== undefined) payload.name = playerData.name;
        if (playerData.rank !== undefined) payload.rank = parseInt(playerData.rank, 10);
        if (playerData.playingStyle !== undefined) payload.playing_style = playerData.playingStyle;
        if (playerData.playingHand !== undefined) payload.playing_hand = playerData.playingHand;
        if (playerData.biography !== undefined) payload.biography = playerData.biography;
        if (playerData.country !== undefined) payload.country = playerData.country;
        if (playerData.achievements !== undefined) payload.achievements = playerData.achievements;
        if (playerData.avatarUrl !== undefined) payload.avatar_url = playerData.avatarUrl;
        if (playerData.equipment !== undefined) payload.equipment = playerData.equipment;
        if (playerData.promoVideo !== undefined) payload.promo_video = playerData.promoVideo;
        if (playerData.gallery !== undefined) payload.gallery = playerData.gallery;

        const { data, error } = await supabase
          .from('players')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return formatPlayer(data, votesMap[id] || 0);
        }
        if (error) console.error('Supabase update error:', error.message);
      } catch (err) {
        console.error('Supabase update player error:', err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      const updated = await Player.findByIdAndUpdate(id, playerData, { new: true });
      return formatPlayer(updated, votesMap[id] || 0);
    } else {
      const data = dbConfig.getLocalData();
      const idx = data.players.findIndex(p => p._id === id || p.id === id);
      if (idx === -1) return null;
      const existing = data.players[idx];
      const updated = { ...existing, ...playerData };
      data.players[idx] = updated;
      dbConfig.saveLocalData(data);
      return formatPlayer(updated, votesMap[id] || 0);
    }
  },

  async incrementVote(id) {
    const votesMap = await getVotesMap();
    votesMap[id] = (parseInt(votesMap[id], 10) || 0) + 1;
    await saveVotesMap(votesMap);
    return await this.getById(id);
  },

  async delete(id) {
    const votesMap = await getVotesMap();
    delete votesMap[id];
    await saveVotesMap(votesMap);

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('players')
          .delete()
          .eq('id', id)
          .select()
          .maybeSingle();

        if (data) return formatPlayer(data, 0);
      } catch (err) {
        console.error('Supabase delete player error:', err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      const del = await Player.findByIdAndDelete(id);
      return formatPlayer(del, 0);
    } else {
      const data = dbConfig.getLocalData();
      const idx = data.players.findIndex(p => p._id === id || p.id === id);
      if (idx === -1) return null;
      const deletedPlayer = data.players[idx];
      data.players.splice(idx, 1);
      dbConfig.saveLocalData(data);
      return formatPlayer(deletedPlayer, 0);
    }
  },

  async count() {
    if (isSupabaseConfigured()) {
      try {
        const { count, error } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) return count;
      } catch (err) {
        console.error('Supabase player count error:', err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      return await Player.countDocuments();
    } else {
      return dbConfig.getLocalData().players.length;
    }
  },

  // Compute stats from a single getAll() call instead of calling getAll() twice
  async getStats() {
    const players = await this.getAll();
    let totalPhotos = 0;
    let totalVideos = 0;
    players.forEach(p => {
      if (p.avatarUrl) totalPhotos++;
      if (p.gallery && Array.isArray(p.gallery)) totalPhotos += p.gallery.length;
      if (p.promoVideo && p.promoVideo.url) totalVideos++;
    });
    return { totalPlayers: players.length, totalPhotos, totalVideos };
  },

  async getTotalPhotos() {
    const players = await this.getAll();
    let count = 0;
    players.forEach(p => {
      if (p.avatarUrl) count++;
      if (p.gallery && Array.isArray(p.gallery)) count += p.gallery.length;
    });
    return count;
  },

  async getTotalVideos() {
    const players = await this.getAll();
    let count = 0;
    players.forEach(p => {
      if (p.promoVideo && p.promoVideo.url) count++;
    });
    return count;
  },

  async resetVotes() {
    await saveVotesMap({});
  }
};
