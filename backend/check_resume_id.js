require('dotenv').config();
const supabase = require('./config/db');

async function checkResume() {
  const { data, error } = await supabase.from('resumes').select('id').eq('id', 'f0b4a58f-43b2-4c56-b8e5-d2d51d7166ce').single();
  console.log('Resume exists:', !!data);
  if (error) console.log('Error:', error.message);
}
checkResume();
