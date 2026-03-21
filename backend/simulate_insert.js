require('dotenv').config();
const supabase = require('./config/db');

async function testInsert() {
  const interviewData = {
    user_id: 'user_test_123',
    resume_id: 'f0b4a58f-43b2-4c56-b8e5-d2d51d7166ce',
    target_role: 'Full Stack',
    difficulty: 'intermediate',
    round_type: 'mixed',
    status: 'active',
    current_round: 1,
    total_rounds: 5,
    resume_context: {
        summary: "Test summary",
        skills: ["React", "Node"],
        role: "Full Stack",
        experience: 5
    }
  };

  const { data, error } = await supabase
    .from('interviews')
    .insert(interviewData)
    .select('*')
    .single();

  if (error) {
    console.log('Insert Failed!');
    console.log('Error Message:', error.message);
    console.log('Error Details:', error.details);
    console.log('Error Hint:', error.hint);
    console.log('Error Code:', error.code);
  } else {
    console.log('Insert Success:', data.id);
  }
}

testInsert();
