const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true },
  player1: { type: Object, default: null },
  player2: { type: Object, default: null },
  winner: { type: Object, default: null },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

const roundSchema = new mongoose.Schema({
  roundName: { type: String, required: true },
  roundNumber: { type: Number, required: true },
  matches: [matchSchema]
});

const tournamentSchema = new mongoose.Schema({
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  totalPlayers: { type: Number, default: 0 },
  pools: {
    poolA: [Object],
    poolB: [Object]
  },
  rounds: [roundSchema],
  champion: { type: Object, default: null },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
