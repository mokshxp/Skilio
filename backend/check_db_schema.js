require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Checking interview_sessions...");
    const { data: sessions, error: sErr } = await supabase.from('interview_sessions').select('*').limit(1);
    if (sErr) console.error("Error sessions:", sErr.message);
    else if (sessions.length > 0) console.log("Sessions columns:", Object.keys(sessions[0]));
    else console.log("Sessions table exists but empty.");

    console.log("Checking questions...");
    const { data: questions, error: qErr } = await supabase.from('questions').select('*').limit(1);
    if (qErr) console.error("Error questions:", qErr.message);
    else if (questions.length > 0) console.log("Questions columns:", Object.keys(questions[0]));
    else console.log("Questions table exists but empty.");
}

check();
