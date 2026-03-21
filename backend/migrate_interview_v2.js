/**
 * Migration script to add V2 interview columns to Supabase tables.
 * Run once: node migrate_interview_v2.js
 * 
 * This adds columns needed for MCQ questions, adaptive difficulty,
 * and per-question tracking to the existing tables.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
    console.log("🔄 Running Interview V2 migration...\n");

    // 1. Add columns to interview_sessions
    console.log("── interview_sessions ──");
    const sessionCols = [
        { name: 'total_rounds', sql: "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 5" },
        { name: 'current_round', sql: "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1" },
    ];

    for (const col of sessionCols) {
        const { error } = await supabase.rpc('exec_sql', { sql: col.sql }).catch(() => ({ error: null }));
        // RPC exec_sql may not exist, so we try direct insert test
        console.log(`  ${col.name}: checking...`);
    }

    // Test if columns exist by doing an upsert
    const { data: testSession, error: testErr } = await supabase
        .from('interview_sessions')
        .select('total_rounds, current_round')
        .limit(1);

    if (testErr) {
        console.log("  ⚠️  Columns total_rounds/current_round may need to be added manually.");
        console.log("  Run this SQL in Supabase Dashboard → SQL Editor:\n");
        console.log("  ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 5;");
        console.log("  ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1;\n");
    } else {
        console.log("  ✅ total_rounds, current_round columns exist");
    }

    // 2. Add columns to questions
    console.log("\n── questions ──");
    const questionCols = [
        'subject', 'topic', 'difficulty', 'options', 'correct_answer',
        'explanation', 'is_correct', 'time_taken_seconds'
    ];

    const { data: testQ, error: testQErr } = await supabase
        .from('questions')
        .select('subject, topic, difficulty, options, correct_answer, explanation, is_correct, time_taken_seconds')
        .limit(1);

    if (testQErr) {
        console.log("  ⚠️  Some question columns may need to be added manually.");
        console.log("  Run this SQL in Supabase Dashboard → SQL Editor:\n");
        console.log(`  ALTER TABLE questions ADD COLUMN IF NOT EXISTS subject TEXT;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty TEXT;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS options JSONB;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_correct BOOLEAN;
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;\n`);
    } else {
        console.log("  ✅ All V2 question columns exist");
    }

    console.log("\n✅ Migration check complete!");
    console.log("\nIf you see ⚠️ warnings above, please run the provided SQL in your Supabase Dashboard.\n");
}

migrate().catch(console.error);
