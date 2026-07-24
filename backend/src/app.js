const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const pollRoutes = require('./routes/pollRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Gzip compression — reduces API response sizes by ~70%
try {
  const compression = require('compression');
  app.use(compression());
} catch (e) {
  // compression package not installed, skip silently
}

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder', 'ngrok-skip-browser-warning']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded files with aggressive caching (7 days)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

// Short cache (30s) for public GET API routes — repeat visits are instant
const cachePublicGet = (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  }
  next();
};

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/players', cachePublicGet, playerRoutes);
app.use('/api/settings', cachePublicGet, settingsRoutes);
app.use('/api/tournament', cachePublicGet, tournamentRoutes);
app.use('/api/poll', cachePublicGet, pollRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Register Global Error Handler
app.use(errorHandler);

module.exports = app;
