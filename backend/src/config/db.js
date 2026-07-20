const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;
const JSON_DB_DIR = path.join(__dirname, '..', '..', 'data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

// Initialize the local JSON file database structure if needed
function initLocalDB() {
  if (!fs.existsSync(JSON_DB_DIR)) {
    fs.mkdirSync(JSON_DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(JSON_DB_PATH)) {
    const defaultData = {
      users: [],
      players: [],
      settings: {
        websiteName: "Championship Table Tennis Club",
        logoUrl: "",
        bannerUrl: "",
        aboutContent: "Welcome to our premier table tennis showcase. We feature elite table tennis players, highlighting their rankings, specialized equipment, styles, and training footage.",
        contactEmail: "info@championshiptt.com",
        contactPhone: "+1 (555) 123-4567",
        location: "123 Ping Pong Way, Sports City",
        socialLinks: {
          facebook: "https://facebook.com",
          instagram: "https://instagram.com",
          youtube: "https://youtube.com"
        },
        footerText: "© 2026 Championship Table Tennis Club. All rights reserved."
      }
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    console.log("Initialized local JSON Database at:", JSON_DB_PATH);
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  
  initLocalDB();

  if (!mongoUri) {
    console.warn("WARNING: MONGO_URI not provided. Falling back to local JSON database storage.");
    isMongoConnected = false;
    return false;
  }

  try {
    // Set connection timeout to 4 seconds so it falls back quickly if offline
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log("SUCCESS: Connected to MongoDB Atlas successfully.");
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.error("ERROR: Failed to connect to MongoDB. Falling back to local JSON database. Error details:", error.message);
    isMongoConnected = false;
    return false;
  }
}

function getLocalData() {
  initLocalDB();
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local DB:", err);
    return { users: [], players: [], settings: {} };
  }
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing to local DB:", err);
  }
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  getLocalData,
  saveLocalData,
  JSON_DB_PATH
};
