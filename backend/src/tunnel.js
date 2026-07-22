const localtunnel = require('localtunnel');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://tslqkswcrbihlavccjek.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSupabaseUrl(url) {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 'api_config', social_links: { active_url: url } });
    
    if (error) {
      console.error('Failed to update Supabase API config:', error.message);
    } else {
      console.log('Successfully updated Supabase API config with URL:', url);
    }
  } catch (err) {
    console.error('Error updating Supabase:', err.message);
  }
}

async function startTunnel() {
  console.log('Starting localtunnel...');
  try {
    const tunnel = await localtunnel({
      port: 5000,
      subdomain: 'table-tennis-showcase-backend'
    });

    console.log('Tunnel opened at:', tunnel.url);
    await updateSupabaseUrl(tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting...');
      setTimeout(startTunnel, 5000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      try {
        tunnel.close();
      } catch (e) {}
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    setTimeout(startTunnel, 10000);
  }
}

startTunnel();
