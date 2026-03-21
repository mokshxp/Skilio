require('dotenv').config();
const supabase = require('./config/db');

async function checkSubTables() {
  const { data: sub, error: subErr } = await supabase.from('subscriptions').select('id').limit(1);
  const { data: use, error: useErr } = await supabase.from('usage_events').select('id').limit(1);
  const { data: prof, error: profErr } = await supabase.from('profiles').select('id').limit(1);
  const { data: users, error: usersErr } = await supabase.from('users').select('id').limit(1);

  console.log('subscriptions exists:', !subErr || subErr.code !== 'PGRST116');
  if (subErr) console.log('subscriptions error:', subErr.message);

  console.log('usage_events exists:', !useErr || useErr.code !== 'PGRST116');
  if (useErr) console.log('usage_events error:', useErr.message);

  console.log('profiles exists:', !profErr || profErr.code !== 'PGRST116');
  if (profErr) console.log('profiles error:', profErr.message);

  console.log('users exists:', !usersErr || usersErr.code !== 'PGRST116');
  if (usersErr) console.log('users error:', usersErr.message);
}
checkSubTables();
