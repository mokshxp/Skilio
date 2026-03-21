require('dotenv').config();
const supabase = require('./config/db');

async function checkIds() {
  const { data } = await supabase.from('interviews').select('id').limit(5);
  console.log('Interviews IDs:', data.map(d => d.id).join(', '));
}
checkIds();
