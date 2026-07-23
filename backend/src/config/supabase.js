const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

let rawUrl = process.env.SUPABASE_URL || 'https://tslqkswcrbihlavccjek.supabase.co';
if (rawUrl) rawUrl = rawUrl.replace(/^"|"$/g, '').trim();
const supabaseUrl = rawUrl;

let rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
if (rawKey) rawKey = rawKey.replace(/^"|"$/g, '').trim();
const supabaseKey = rawKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Supabase URL or Service Role Key missing in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY));
}

module.exports = {
  supabase,
  isSupabaseConfigured
};
