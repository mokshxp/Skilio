require('dotenv').config();
const supabase = require('./config/db');

async function checkSubCols() {
  const { data, error } = await supabase.from('subscriptions').select('*').limit(1);
  if (error) {
    console.log('Subscriptions table found but select failed:', error.message);
  } else {
    console.log('Subscriptions columns:', Object.keys(data[0] || {}).join(', '));
  }
}
checkSubCols();
