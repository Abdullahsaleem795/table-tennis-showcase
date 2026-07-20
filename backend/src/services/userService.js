const User = require('../models/User');
const dbConfig = require('../config/db');

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

module.exports = {
  async findByUsername(username) {
    if (dbConfig.isMongoConnected()) {
      return await User.findOne({ username });
    } else {
      const data = dbConfig.getLocalData();
      return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }
  },

  async findById(id) {
    if (dbConfig.isMongoConnected()) {
      return await User.findById(id);
    } else {
      const data = dbConfig.getLocalData();
      return data.users.find(u => u._id === id);
    }
  },

  async create(userData) {
    if (dbConfig.isMongoConnected()) {
      const newUser = new User(userData);
      return await newUser.save();
    } else {
      const data = dbConfig.getLocalData();
      const newUser = {
        _id: generateId(),
        username: userData.username,
        password: userData.password,
        createdAt: new Date().toISOString()
      };
      data.users.push(newUser);
      dbConfig.saveLocalData(data);
      return newUser;
    }
  },

  async count() {
    if (dbConfig.isMongoConnected()) {
      return await User.countDocuments();
    } else {
      const data = dbConfig.getLocalData();
      return data.users.length;
    }
  }
};
