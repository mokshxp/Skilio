require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testQuestions() {
    // Get the last test session
    const { data: session } = await supabase.from('interview_sessions').select('id').order('start_time', { ascending: false }).limit(1).single();

    if (!session) return console.error("No session found");

    console.log("Testing insert into questions with coding columns...");
    const { data: qData, error: qErr } = await supabase.from('questions').insert({
        interview_id: session.id,
        content: 'Test question',
        type: 'theory',
        question_number: 1,
        title: 'Title Test',
        description: 'Desc Test'
    }).select().single();

    if (qErr) {
        console.error("❌ Question Insert Failed:", qErr.message);
    } else {
        console.log("✅ Question Inserted:", qData.id);
        console.log("Full question object:", qData);
    }
}

testQuestions();
