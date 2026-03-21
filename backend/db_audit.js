require('dotenv').config();
const supabase = require('./config/db');

async function dbAudit() {
  const tables = ['interviews', 'interview_sessions', 'interview_questions'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    if (error) {
      console.log(`Table [${t}]: FAILED. Code: ${error.code}, Msg: ${error.message}`);
    } else {
      console.log(`Table [${t}]: SUCCESS.`);
    }
  }
}
dbAudit();
