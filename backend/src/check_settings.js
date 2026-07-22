const { supabase } = require('./config/supabase');

async function check() {
  // Check what's in settings table
  const { data, error } = await supabase
    .from('settings')
    .select('*');

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Settings rows:', JSON.stringify(data, null, 2));
  }
}

check();
