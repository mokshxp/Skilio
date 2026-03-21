require('dotenv').config();
const supabase = require('./config/db');

async function testUserId() {
  const { data, error } = await supabase.from('interviews').insert({ user_id: 'user_2Nmq...' }).select('id');
  console.log('User ID string insert Success:', !error);
  if (error) console.log('Error:', error.message, error.code, error.details);
}
testUserId();
