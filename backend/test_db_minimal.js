require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
    console.log("Testing insert into interview_sessions with minimal columns...");
    const { data: sData, error: sErr } = await supabase.from('interview_sessions').insert({
        user_id: 'test_user',
        role: 'Software Engineer',
        difficulty: 'Medium',
        round_type: 'theory'
    }).select().single();

    if (sErr) {
        console.error("❌ Session Insert Failed:", sErr.message);
    } else {
        console.log("✅ Session Inserted:", sData.id);
        console.log("Full session object:", sData);
    }
}

testInsert();
