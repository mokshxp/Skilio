require('dotenv').config();
const supabase = require('./config/db');

async function debugInsert() {
  const payload = {
    user_id: 'test_user_' + Date.now(),
    target_role: 'Full Stack',
    difficulty: 'intermediate',
    round_type: 'mixed',
    status: 'active',
    current_round: 1,
    total_rounds: 5
  };

  const { data, error } = await supabase.from('interviews').insert(payload).select();
  if (error) {
    console.log('--- ERROR JSON ---');
    console.log(JSON.stringify(error, null, 2));
    console.log('------------------');
  } else {
    console.log('Success!', data[0].id);
  }
}

debugInsert();
