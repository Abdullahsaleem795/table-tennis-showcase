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

// Cache for public GET API routes: browsers/CDN serve straight from cache for
// 60s, then keep serving the stale response instantly for up to 5 more
// minutes while revalidating in the background — repeat visits are instant
// and admin edits still show up within a minute.
const cachePublicGet = (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
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

// TEMPORARY diagnostic route — isolates which query shape is actually slow
// in production. Remove after diagnosing the /api/players latency issue.
app.get('/api/_diag', async (req, res, next) => {
  try {
    const { supabase } = require('./config/supabase');
    const results = {};

    let t = Date.now();
    await supabase.from('players').select('*').order('rank', { ascending: true });
    results.plain_select = Date.now() - t;

    t = Date.now();
    await supabase.from('players').select('*').order('rank', { ascending: true }).range(0, 11);
    results.select_with_range = Date.now() - t;

    t = Date.now();
    await supabase.from('players').select('id', { count: 'exact', head: true });
    results.count_head_only = Date.now() - t;

    t = Date.now();
    await supabase.from('players').select('*', { count: 'exact' }).order('rank', { ascending: true }).range(0, 11);
    results.select_range_and_exact_count_combined = Date.now() - t;

    t = Date.now();
    await supabase.from('settings').select('*').eq('id', 'poll_votes').maybeSingle();
    results.votes_map_query = Date.now() - t;

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Register Global Error Handler
app.use(errorHandler);

module.exports = app;
