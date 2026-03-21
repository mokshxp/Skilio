require('dotenv').config();
const supabase = require('./config/db');

async function testResumeId() {
  const { data, error } = await supabase.from('interviews').select('resume_id').limit(1);
  console.log('resume_id exists:', !error);
  if (error) console.log('Error:', error.message);
}
testResumeId();
