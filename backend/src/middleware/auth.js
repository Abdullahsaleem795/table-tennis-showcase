const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, authorization denied.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token format is incorrect, authorization denied.' });
    }

    const secret = process.env.JWT_SECRET || 'supersecret_tabletennis_key_2026';
    const decoded = jwt.verify(token, secret);
    
    // Find the user to verify session is still active
    const user = await userService.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User session has expired or no longer exists.' });
    }

    req.user = { id: user._id || user.id, username: user.username };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is invalid, authorization denied.' });
  }
};
