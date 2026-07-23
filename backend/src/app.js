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

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder', 'ngrok-skip-browser-warning']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Register Global Error Handler
app.use(errorHandler);

module.exports = app;
