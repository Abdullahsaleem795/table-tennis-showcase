const { supabase } = require('./config/supabase');

async function updateUrl() {
  const url = 'https://citizens-collectible-examines-former.trycloudflare.com';
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'api_config', social_links: { active_url: url } });

  if (error) {
    console.error('Failed to update Supabase API config:', error.message);
  } else {
    console.log('Successfully updated Supabase API config with Cloudflare URL:', url);
  }
}

updateUrl();
