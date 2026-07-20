const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const errorHandler = require('./middleware/errorHandler');
const userService = require('./services/userService');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for development and deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Register Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
async function startServer() {
  await connectDB();

  // Seed default admin user if none exists
  try {
    const adminCount = await userService.count();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);
      await userService.create({
        username: 'admin',
        password: hashedPassword
      });
      console.log('Seeded default admin user: admin / AdminPassword123!');
    }
  } catch (err) {
    console.error('Error seeding default administrator:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer();
