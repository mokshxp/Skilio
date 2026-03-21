require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
    const tables = [
        'interviews',
        'interview_sessions',
        'questions',
        'interview_questions',
        'interview_responses',
        'interview_round_summaries',
        'chatbot_messages',
        'user_analytics'
    ];

    console.log("Checking tables for resume_id column...");
    for (const table of tables) {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
        
        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
            continue;
        }

        const hasResumeId = data && data[0] && 'resume_id' in data[0];
        console.log(`${hasResumeId ? '✅' : '⚪'} ${table}: ${hasResumeId ? 'HAS resume_id' : 'no resume_id'}`);
    }
}

checkColumns();
