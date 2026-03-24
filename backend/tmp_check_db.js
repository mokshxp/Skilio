require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('id, round_number, correct_answer, options')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log("RECENT QUESTIONS:");
    data.forEach(q => {
      console.log(`ID: ${q.id} | Round: ${q.round_number} | Correct: [${q.correct_answer}]`);
      console.log(`Options: ${JSON.stringify(q.options)}`);
    });
  }
}

check();
