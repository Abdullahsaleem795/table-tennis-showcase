const { supabase } = require('./supabase');

async function test() {
  try {
    const { data, error } = await supabase.from('players').select('*').limit(1);
    console.log("Supabase Schema Check:");
    console.log("Error:", error ? error.message : "None");
    if (data && data.length > 0) {
      console.log("First player attributes:", Object.keys(data[0]));
    } else {
      console.log("No players found in table to inspect.");
    }
  } catch (err) {
    console.error("Execution error:", err.message);
  }
}

test();
