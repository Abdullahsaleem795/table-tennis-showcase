const { supabase } = require('./config/supabase');

async function updateApiUrl() {
  const activeUrl = 'https://little-grasshopper-88.loca.lt';
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'api_config', social_links: { active_url: activeUrl } });

  if (error) {
    console.error('Failed to update api_config:', error.message);
  } else {
    console.log('Updated api_config with URL:', activeUrl);
  }
}

updateApiUrl();
