const Player = require('../models/Player');
const dbConfig = require('../config/db');

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Automatically resolve rank conflicts by shifting subsequent ranks down
async function resolveRankConflicts(targetRank, excludeId = null) {
  targetRank = parseInt(targetRank, 10);
  if (isNaN(targetRank) || targetRank < 1) return;

  if (dbConfig.isMongoConnected()) {
    // Find all players with rank >= targetRank
    const query = { rank: { $gte: targetRank } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const conflictingPlayers = await Player.find(query).sort({ rank: 1 });
    
    // Shift conflicting ranks sequentially to maintain uniqueness
    let currentShiftRank = targetRank;
    for (const p of conflictingPlayers) {
      if (p.rank === currentShiftRank) {
        p.rank = currentShiftRank + 1;
        await p.save();
        currentShiftRank++;
      } else {
        break; // gap exists, no further shifting needed
      }
    }
  } else {
    const data = dbConfig.getLocalData();
    let players = data.players;
    
    // Sort players by rank ascending
    players.sort((a, b) => a.rank - b.rank);
    
    let currentShiftRank = targetRank;
    for (let i = 0; i < players.length; i++) {
      if (excludeId && players[i]._id === excludeId) continue;
      
      if (players[i].rank === currentShiftRank) {
        players[i].rank = currentShiftRank + 1;
        currentShiftRank++;
      }
    }
    dbConfig.saveLocalData(data);
  }
}

module.exports = {
  async getAll() {
    if (dbConfig.isMongoConnected()) {
      return await Player.find({}).sort({ rank: 1 });
    } else {
      const data = dbConfig.getLocalData();
      const players = [...data.players];
      return players.sort((a, b) => a.rank - b.rank);
    }
  },

  async getById(id) {
    if (dbConfig.isMongoConnected()) {
      return await Player.findById(id);
    } else {
      const data = dbConfig.getLocalData();
      return data.players.find(p => p._id === id);
    }
  },

  async create(playerData) {
    // Ensure unique rank shifting
    await resolveRankConflicts(playerData.rank);

    if (dbConfig.isMongoConnected()) {
      const newPlayer = new Player(playerData);
      return await newPlayer.save();
    } else {
      const data = dbConfig.getLocalData();
      const newPlayer = {
        _id: generateId(),
        name: playerData.name,
        rank: parseInt(playerData.rank, 10),
        playingStyle: playerData.playingStyle,
        playingHand: playerData.playingHand,
        biography: playerData.biography || '',
        country: playerData.country || '',
        achievements: playerData.achievements || [],
        avatarUrl: playerData.avatarUrl || '',
        equipment: {
          blade: {
            brand: playerData.equipment?.blade?.brand || '',
            model: playerData.equipment?.blade?.model || ''
          },
          forehandRubber: {
            brand: playerData.equipment?.forehandRubber?.brand || '',
            model: playerData.equipment?.forehandRubber?.model || '',
            spongeThickness: playerData.equipment?.forehandRubber?.spongeThickness || '',
            speed: parseFloat(playerData.equipment?.forehandRubber?.speed) || 0,
            spin: parseFloat(playerData.equipment?.forehandRubber?.spin) || 0
          },
          backhandRubber: {
            brand: playerData.equipment?.backhandRubber?.brand || '',
            model: playerData.equipment?.backhandRubber?.model || '',
            spongeThickness: playerData.equipment?.backhandRubber?.spongeThickness || '',
            speed: parseFloat(playerData.equipment?.backhandRubber?.speed) || 0,
            spin: parseFloat(playerData.equipment?.backhandRubber?.spin) || 0
          }
        },
        promoVideo: {
          type: playerData.promoVideo?.type || 'external',
          url: playerData.promoVideo?.url || ''
        },
        gallery: playerData.gallery || [],
        createdAt: new Date().toISOString()
      };
      
      data.players.push(newPlayer);
      dbConfig.saveLocalData(data);
      return newPlayer;
    }
  },

  async update(id, playerData) {
    if (playerData.rank) {
      await resolveRankConflicts(playerData.rank, id);
    }

    if (dbConfig.isMongoConnected()) {
      return await Player.findByIdAndUpdate(id, playerData, { new: true });
    } else {
      const data = dbConfig.getLocalData();
      const idx = data.players.findIndex(p => p._id === id);
      if (idx === -1) return null;

      const existing = data.players[idx];
      const updated = {
        ...existing,
        ...playerData,
        rank: playerData.rank ? parseInt(playerData.rank, 10) : existing.rank,
        equipment: {
          blade: {
            brand: playerData.equipment?.blade?.brand !== undefined ? playerData.equipment.blade.brand : existing.equipment?.blade?.brand || '',
            model: playerData.equipment?.blade?.model !== undefined ? playerData.equipment.blade.model : existing.equipment?.blade?.model || ''
          },
          forehandRubber: {
            brand: playerData.equipment?.forehandRubber?.brand !== undefined ? playerData.equipment.forehandRubber.brand : existing.equipment?.forehandRubber?.brand || '',
            model: playerData.equipment?.forehandRubber?.model !== undefined ? playerData.equipment.forehandRubber.model : existing.equipment?.forehandRubber?.model || '',
            spongeThickness: playerData.equipment?.forehandRubber?.spongeThickness !== undefined ? playerData.equipment.forehandRubber.spongeThickness : existing.equipment?.forehandRubber?.spongeThickness || '',
            speed: playerData.equipment?.forehandRubber?.speed !== undefined ? parseFloat(playerData.equipment.forehandRubber.speed) : existing.equipment?.forehandRubber?.speed || 0,
            spin: playerData.equipment?.forehandRubber?.spin !== undefined ? parseFloat(playerData.equipment.forehandRubber.spin) : existing.equipment?.forehandRubber?.spin || 0
          },
          backhandRubber: {
            brand: playerData.equipment?.backhandRubber?.brand !== undefined ? playerData.equipment.backhandRubber.brand : existing.equipment?.backhandRubber?.brand || '',
            model: playerData.equipment?.backhandRubber?.model !== undefined ? playerData.equipment.backhandRubber.model : existing.equipment?.backhandRubber?.model || '',
            spongeThickness: playerData.equipment?.backhandRubber?.spongeThickness !== undefined ? playerData.equipment.backhandRubber.spongeThickness : existing.equipment?.backhandRubber?.spongeThickness || '',
            speed: playerData.equipment?.backhandRubber?.speed !== undefined ? parseFloat(playerData.equipment.backhandRubber.speed) : existing.equipment?.backhandRubber?.speed || 0,
            spin: playerData.equipment?.backhandRubber?.spin !== undefined ? parseFloat(playerData.equipment.backhandRubber.spin) : existing.equipment?.backhandRubber?.spin || 0
          }
        },
        promoVideo: {
          type: playerData.promoVideo?.type !== undefined ? playerData.promoVideo.type : existing.promoVideo?.type || 'external',
          url: playerData.promoVideo?.url !== undefined ? playerData.promoVideo.url : existing.promoVideo?.url || ''
        },
        gallery: playerData.gallery !== undefined ? playerData.gallery : existing.gallery || []
      };

      data.players[idx] = updated;
      dbConfig.saveLocalData(data);
      return updated;
    }
  },

  async delete(id) {
    if (dbConfig.isMongoConnected()) {
      return await Player.findByIdAndDelete(id);
    } else {
      const data = dbConfig.getLocalData();
      const idx = data.players.findIndex(p => p._id === id);
      if (idx === -1) return null;

      const deletedPlayer = data.players[idx];
      data.players.splice(idx, 1);
      dbConfig.saveLocalData(data);
      return deletedPlayer;
    }
  },

  async count() {
    if (dbConfig.isMongoConnected()) {
      return await Player.countDocuments();
    } else {
      const data = dbConfig.getLocalData();
      return data.players.length;
    }
  },

  async getTotalPhotos() {
    let players = [];
    if (dbConfig.isMongoConnected()) {
      players = await Player.find({});
    } else {
      players = dbConfig.getLocalData().players;
    }

    let count = 0;
    players.forEach(p => {
      if (p.avatarUrl) count++;
      if (p.gallery && Array.isArray(p.gallery)) {
        count += p.gallery.length;
      }
    });
    return count;
  },

  async getTotalVideos() {
    let players = [];
    if (dbConfig.isMongoConnected()) {
      players = await Player.find({});
    } else {
      players = dbConfig.getLocalData().players;
    }

    let count = 0;
    players.forEach(p => {
      if (p.promoVideo && p.promoVideo.url) {
        count++;
      }
    });
    return count;
  }
};
