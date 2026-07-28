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
    points: p.points || 0,
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

// ─── OPTIMIZED points-based ranking ──────────────────────────────────────
async function recalculateRanks() {
  if (isSupabaseConfigured()) {
    try {
      const { data: players } = await supabase
        .from('players')
        .select('id, points, rank')
        .order('points', { ascending: false, nullsFirst: false });

      if (players && players.length > 0) {
        const toUpdate = [];
        let currentRank = 1;
        let currentPoints = players[0].points;

        players.forEach((p, index) => {
          if (p.points < currentPoints) {
            currentRank = index + 1; // Standard competition ranking (e.g. 1, 2, 2, 4)
            currentPoints = p.points;
          }
          if (p.rank !== currentRank) {
            toUpdate.push({ id: p.id, rank: currentRank });
          }
        });

        if (toUpdate.length > 0) {
          // Phase 1: Set ALL changing players to unique negative ranks to completely clear the board
          const tempPromises = toUpdate.map((u, i) => supabase.from('players').update({ rank: -(1000 + i) }).eq('id', u.id));
          await Promise.all(tempPromises);
          
          // Phase 2: Set to correct final tied ranks
          const finalPromises = toUpdate.map(u => supabase.from('players').update({ rank: u.rank }).eq('id', u.id));
          await Promise.all(finalPromises);
        }
      }
    } catch (err) {
      console.error('Supabase recalculate ranks error:', err.message);
    }
  } else if (dbConfig.isMongoConnected()) {
    const players = await Player.find({}).sort({ points: -1 }).select('_id rank');
    const bulkOps = [];
    players.forEach((p, index) => {
      const expectedRank = index + 1;
      if (p.rank !== expectedRank) {
        bulkOps.push({
          updateOne: {
            filter: { _id: p._id },
            update: { rank: expectedRank }
          }
        });
      }
    });
    if (bulkOps.length > 0) {
      await Player.bulkWrite(bulkOps);
    }
  } else {
    const data = dbConfig.getLocalData();
    let updated = false;
    data.players.sort((a, b) => (b.points || 0) - (a.points || 0));
    data.players.forEach((p, index) => {
      const expectedRank = index + 1;
      if (p.rank !== expectedRank) {
        p.rank = expectedRank;
        updated = true;
      }
    });
    if (updated) {
      dbConfig.saveLocalData(data);
    }
  }
}

module.exports = {
  async getAll(page, limit, search, style) {
    const isPaginated = page !== undefined && limit !== undefined;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    const votesMap = await getVotesMap();

    if (isSupabaseConfigured()) {
      // Applying the same filters to a data query and a separate count query.
      // Combining `count: 'exact'` with `.range()` in one query forces
      // PostgREST to compute an exact count via a window function, which
      // interacts very badly with Row Level Security policies — a 12-row
      // table went from ~0.5s to 9-56s. A plain select is fast; a
      // `head: true` count-only query (no row data) run in parallel is fast
      // too. Doing both separately avoids the slow combined query plan.
      const applyFilters = (q) => {
        if (search) {
          if (!isNaN(parseInt(search, 10))) {
            q = q.or(`name.ilike.%${search}%,rank.eq.${parseInt(search, 10)}`);
          } else {
            q = q.ilike('name', `%${search}%`);
          }
        }
        if (style && style !== 'All') {
          q = q.eq('playing_style', style);
        }
        return q;
      };

      let dataQuery = applyFilters(supabase.from('players').select('*').order('rank', { ascending: true }));
      if (isPaginated) {
        dataQuery = dataQuery.range(offset, offset + limitNum - 1);
      }

      const countPromise = isPaginated
        ? applyFilters(supabase.from('players').select('id', { count: 'exact', head: true }))
        : Promise.resolve({ count: 0 });

      const [{ data, error }, { count }] = await Promise.all([dataQuery, countPromise]);

      if (!error && data) {
        const formatted = data.map(p => formatPlayer(p, votesMap[p.id] || 0));
        if (isPaginated) {
          return { data: formatted, total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) };
        }
        return formatted;
      }
    }

    if (dbConfig.isMongoConnected()) {
      if (isPaginated) {
        const total = await Player.countDocuments();
        const players = await Player.find({}).sort({ rank: 1 }).skip(offset).limit(limitNum);
        return {
          data: players.map(p => formatPlayer(p, votesMap[p._id || p.id] || 0)),
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum)
        };
      } else {
        const players = await Player.find({}).sort({ rank: 1 });
        return players.map(p => formatPlayer(p, votesMap[p._id || p.id] || 0));
      }
    } else {
      const dbData = dbConfig.getLocalData();
      const players = [...dbData.players].sort((a, b) => a.rank - b.rank);
      const formatted = players.map(p => formatPlayer(p, votesMap[p._id || p.id] || 0));
      
      if (isPaginated) {
        return {
          data: formatted.slice(offset, offset + limitNum),
          total: formatted.length,
          page: pageNum,
          totalPages: Math.ceil(formatted.length / limitNum)
        };
      }
      return formatted;
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
    const newId = generateId();

    if (isSupabaseConfigured()) {
      try {
        const payload = {
          id: newId,
          name: playerData.name,
          rank: 999999, // temp rank
          points: parseInt(playerData.points, 10) || 0,
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

        if (error) {
          console.error('Supabase player insert error:', error.message);
          throw new Error('Database Error: ' + error.message);
        }
        await recalculateRanks();
        // Refetch to get updated rank
        const { data: updatedData } = await supabase.from('players').select('*').eq('id', newId).single();
        return formatPlayer(updatedData, 0);
      } catch (err) {
        console.error('Supabase create player error:', err.message);
        throw err;
      }
    }

    if (dbConfig.isMongoConnected()) {
      playerData.rank = 999999;
      playerData.points = parseInt(playerData.points, 10) || 0;
      const newPlayer = new Player(playerData);
      const saved = await newPlayer.save();
      await recalculateRanks();
      const p = await Player.findById(saved._id);
      return formatPlayer(p, 0);
    } else {
      const data = dbConfig.getLocalData();
      const newPlayer = {
        _id: newId,
        id: newId,
        name: playerData.name,
        email: playerData.email || '',
        rank: 999999,
        points: parseInt(playerData.points, 10) || 0,
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
      await recalculateRanks();
      const p = dbConfig.getLocalData().players.find(x => x.id === newId);
      return formatPlayer(p, 0);
    }
  },

  async update(id, playerData) {
    let requiresRecalc = false;
    if (playerData.points !== undefined) {
      playerData.points = parseInt(playerData.points, 10) || 0;
      requiresRecalc = true;
    }

    const votesMap = await getVotesMap();

    if (isSupabaseConfigured()) {
      try {
        const payload = {};
        if (playerData.name !== undefined) payload.name = playerData.name;
        if (playerData.points !== undefined) payload.points = playerData.points;
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
          if (requiresRecalc) {
            await recalculateRanks();
            const { data: updatedData } = await supabase.from('players').select('*').eq('id', id).single();
            return formatPlayer(updatedData, votesMap[id] || 0);
          }
          return formatPlayer(data, votesMap[id] || 0);
        }
        if (error) {
          console.error('Supabase update error:', error.message);
          throw new Error('Database Error: ' + error.message);
        }
      } catch (err) {
        console.error('Supabase update player error:', err.message);
        throw err;
      }
    }

    if (dbConfig.isMongoConnected()) {
      await Player.findByIdAndUpdate(id, playerData, { new: true });
      if (requiresRecalc) await recalculateRanks();
      const p = await Player.findById(id);
      return formatPlayer(p, votesMap[id] || 0);
    } else {
      const data = dbConfig.getLocalData();
      const idx = data.players.findIndex(p => p._id === id || p.id === id);
      if (idx === -1) return null;
      const existing = data.players[idx];
      const updated = { ...existing, ...playerData };
      data.players[idx] = updated;
      dbConfig.saveLocalData(data);
      if (requiresRecalc) await recalculateRanks();
      const p = dbConfig.getLocalData().players.find(x => x.id === id);
      return formatPlayer(p, votesMap[id] || 0);
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

        if (data) {
          await recalculateRanks();
          return formatPlayer(data, 0);
        }
      } catch (err) {
        console.error('Supabase delete player error:', err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      const del = await Player.findByIdAndDelete(id);
      await recalculateRanks();
      return formatPlayer(del, 0);
    } else {
      const data = dbConfig.getLocalData();
      const idx = data.players.findIndex(p => p._id === id || p.id === id);
      if (idx === -1) return null;
      const deletedPlayer = data.players[idx];
      data.players.splice(idx, 1);
      dbConfig.saveLocalData(data);
      await recalculateRanks();
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
  // Single full-roster fetch, reused for counts AND the small home-page
  // slices (featured/topVoted/latest/previewPhotos) so the client never has
  // to download every player's full record just to render a homepage.
  async getStats() {
    const players = await this.getAll();
    let totalPhotos = 0;
    let totalVideos = 0;
    players.forEach(p => {
      if (p.avatarUrl) totalPhotos++;
      if (p.gallery && Array.isArray(p.gallery)) totalPhotos += p.gallery.length;
      if (p.promoVideo && p.promoVideo.url) totalVideos++;
    });

    const featured = players.slice(0, 3);

    const topVoted = [...players]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 3);

    const latest = players.length > 0
      ? [...players].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;

    const previewPhotos = [];
    for (const p of players) {
      if (previewPhotos.length >= 6) break;
      if (p.gallery && Array.isArray(p.gallery)) {
        for (const img of p.gallery) {
          if (previewPhotos.length >= 6) break;
          previewPhotos.push({ imgUrl: img, playerId: p._id || p.id, playerName: p.name });
        }
      }
    }

    return {
      totalPlayers: players.length,
      totalPhotos,
      totalVideos,
      featured,
      topVoted,
      latest,
      previewPhotos
    };
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
