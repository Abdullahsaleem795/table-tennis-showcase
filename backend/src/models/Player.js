const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rank: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    default: ''
  },
  playingStyle: {
    type: String,
    enum: ['Attack', 'Defense', 'All Round', 'Offensive', 'Defensive'],
    required: true
  },
  playingHand: {
    type: String,
    enum: ['Right Hand', 'Left Hand'],
    required: true
  },
  biography: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  achievements: {
    type: [String],
    default: []
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  equipment: {
    blade: {
      brand: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    forehandRubber: {
      brand: { type: String, default: '' },
      model: { type: String, default: '' },
      spongeThickness: { type: String, default: '' },
      speed: { type: Number, default: 0 },
      spin: { type: Number, default: 0 }
    },
    backhandRubber: {
      brand: { type: String, default: '' },
      model: { type: String, default: '' },
      spongeThickness: { type: String, default: '' },
      speed: { type: Number, default: 0 },
      spin: { type: Number, default: 0 }
    }
  },
  promoVideo: {
    type: { type: String, enum: ['local', 'external'], default: 'external' },
    url: { type: String, default: '' }
  },
  gallery: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);
