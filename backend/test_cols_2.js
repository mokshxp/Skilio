require('dotenv').config();
const supabase = require('./config/db');

async function testCols() {
  const { data, error } = await supabase.from('interviews').select('current_round').limit(1);
  console.log('current_round exists:', !error);
  if (error) console.log('Error:', error.message);
}
testCols();
