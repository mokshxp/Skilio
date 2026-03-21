require('dotenv').config();
const supabase = require('./config/db');

async function checkSchema() {
  try {
    // Check if interviews table exists
    const { data: interviews, error: intErr } = await supabase.from('interviews').select('id').limit(1);
    console.log('Interviews table:', intErr ? 'ERROR: ' + intErr.message : 'OK');

    // Check if interview_sessions table exists
    const { data: sessions, error: sessErr } = await supabase.from('interview_sessions').select('id').limit(1);
    console.log('Interview sessions table:', sessErr ? 'ERROR: ' + sessErr.message : 'OK');

    // Check if interview_questions table exists
    const { data: questions, error: qErr } = await supabase.from('interview_questions').select('id').limit(1);
    console.log('Interview questions table:', qErr ? 'ERROR: ' + qErr.message : 'OK');

  } catch (err) {
    console.error('Exception:', err);
  }
}

checkSchema();
