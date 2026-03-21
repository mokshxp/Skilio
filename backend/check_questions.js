require('dotenv').config();
const supabase = require('./config/db');

async function checkQuestions() {
  const { data: all, error: e2 } = await supabase.from('interview_questions').select('*').limit(1);
  if (e2) {
    console.error('Questions Error:', e2.message);
  } else {
    console.log('Interview questions columns:', Object.keys(all[0] || {}).join(', '));
  }
}

checkQuestions();
