require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
    console.log("Testing insert into interview_sessions with resume_context...");
    const { data: sData, error: sErr } = await supabase.from('interview_sessions').insert({
        user_id: 'test_user',
        role: 'Software Engineer',
        difficulty: 'Medium',
        round_type: 'theory',
        status: 'in_progress',
        resume_context: 'This is a test resume context'
    }).select().single();

    if (sErr) {
        console.error("❌ Session Insert Failed:", sErr.message);
    } else {
        console.log("✅ Session Inserted:", sData.id);

        console.log("Testing insert into questions with coding columns...");
        const { data: qData, error: qErr } = await supabase.from('questions').insert({
            interview_id: sData.id,
            content: 'Test question',
            type: 'coding',
            question_number: 1,
            title: 'Test Title',
            description: 'Test Description',
            constraints: ['Constraint 1'],
            examples: [{ input: '1', output: '2' }],
            time_limit_seconds: 600
        }).select().single();

        if (qErr) {
            console.error("❌ Question Insert Failed:", qErr.message);
        } else {
            console.log("✅ Question Inserted:", qData.id);
        }
    }
}

testInsert();
