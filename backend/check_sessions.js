require('dotenv').config();
const supabase = require('./config/db');

async function checkSessions() {
  const { data: all, error: e2 } = await supabase.from('interview_sessions').select('*').limit(1);
  if (e2) {
    console.error('Sessions Error:', e2.message);
  } else {
    console.log('Interview sessions columns:', Object.keys(all[0] || {}).join(', '));
  }
}

checkSessions();
