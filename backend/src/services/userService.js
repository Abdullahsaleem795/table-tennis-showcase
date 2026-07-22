const { supabase, isSupabaseConfigured } = require('../config/supabase');
const User = require('../models/User');
const dbConfig = require('../config/db');

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

module.exports = {
  async findByUsername(username) {
    if (isSupabaseConfigured()) {
      try {
        // Query settings table first to bypass RLS issues on users table
        const { data: adminSetting, error: settingError } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'admin_user')
          .maybeSingle();

        if (!settingError && adminSetting && adminSetting.website_name?.toLowerCase() === username.toLowerCase()) {
          return {
            id: 'admin_id_1',
            username: adminSetting.website_name,
            password: adminSetting.social_links?.password
          };
        }

        // Fallback to querying the users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('username', username)
          .maybeSingle();

        if (error) {
          console.error("Supabase user query error details:", error);
          throw new Error(`Supabase query error: ${error.message} (code: ${error.code})`);
        }
        if (data) return data;
      } catch (err) {
        console.error("Supabase findByUsername failed:", err.message);
        throw err;
      }
    }

    if (dbConfig.isMongoConnected()) {
      return await User.findOne({ username });
    } else {
      const data = dbConfig.getLocalData();
      return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }
  },

  async findById(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.error("Supabase findById failed:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      return await User.findById(id);
    } else {
      const data = dbConfig.getLocalData();
      return data.users.find(u => u._id === id || u.id === id);
    }
  },

  async create(userData) {
    const newId = generateId();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              id: newId,
              username: userData.username,
              password: userData.password,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (!error && data) return data;
        if (error) console.error("Supabase user insert notice:", error.message);
      } catch (err) {
        console.error("Supabase create user error:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      const newUser = new User(userData);
      return await newUser.save();
    } else {
      const data = dbConfig.getLocalData();
      const newUser = {
        _id: newId,
        id: newId,
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
    if (isSupabaseConfigured()) {
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) return count;
      } catch (err) {
        console.error("Supabase user count error:", err.message);
      }
    }

    if (dbConfig.isMongoConnected()) {
      return await User.countDocuments();
    } else {
      const data = dbConfig.getLocalData();
      return data.users.length;
    }
  }
};
