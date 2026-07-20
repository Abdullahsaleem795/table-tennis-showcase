const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'supersecret_tabletennis_key_2026';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

module.exports = {
  async register(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }

      const existingUser = await userService.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await userService.create({
        username,
        password: hashedPassword
      });

      res.status(201).json({
        message: 'Admin registered successfully.',
        user: {
          id: user._id || user.id,
          username: user.username
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password.' });
      }

      const user = await userService.findByUsername(username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid administrative credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid administrative credentials.' });
      }

      const token = generateToken(user._id || user.id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id || user.id,
          username: user.username
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await userService.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        id: user._id || user.id,
        username: user.username
      });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both old and new passwords.' });
      }

      const user = await userService.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // In Mongoose/local fallback, the user document returned is just a plain object or model
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect old password.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Save user
      if (require('../config/db').isMongoConnected()) {
        const User = require('../models/User');
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      } else {
        const dbConfig = require('../config/db');
        const data = dbConfig.getLocalData();
        const u = data.users.find(x => x._id === user._id);
        if (u) {
          u.password = hashedPassword;
          dbConfig.saveLocalData(data);
        }
      }

      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      next(err);
    }
  }
};
