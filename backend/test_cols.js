require('dotenv').config();
const supabase = require('./config/db');

async function testCols() {
  const { data, error } = await supabase.from('interviews').select('total_rounds').limit(1);
  console.log('total_rounds exists:', !error);
  if (error) console.log('Error:', error.message);
}
testCols();
