require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('id, topic, test_cases')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

check();
