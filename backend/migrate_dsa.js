require('dotenv').config();
const { Client } = require('pg');

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const sql = `
-- Drop old clashing tables (cascade to clean up dependencies)
DROP TABLE IF EXISTS interview_responses CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS interview_round_summaries CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;

-- Sessions
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  resume_id UUID,
  target_role TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  round_type TEXT NOT NULL CHECK (round_type IN ('technical','coding','behavioural','mixed')),
  status TEXT NOT NULL DEFAULT 'active',
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  resume_context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Questions (MCQ + DSA problems + HR)
CREATE TABLE interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('mcq','dsa','hr')),
  question_text TEXT NOT NULL,
  question_slug TEXT,
  subject TEXT,
  topic TEXT,
  difficulty TEXT,
  -- MCQ fields
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  -- DSA fields
  function_signature JSONB,
  examples JSONB,
  constraints TEXT,
  test_cases JSONB,
  hints JSONB,
  solution_approach TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User responses
CREATE TABLE interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  question_id UUID REFERENCES interview_questions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  user_answer TEXT,
  selected_option TEXT,
  code_solution TEXT,
  language TEXT,
  code_output TEXT,
  test_results JSONB,
  is_correct BOOLEAN,
  score DECIMAL(4,2),
  ai_feedback TEXT,
  improvements TEXT[],
  time_taken_seconds INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round summaries
CREATE TABLE interview_round_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_type TEXT NOT NULL,
  score DECIMAL(5,2),
  correct_count INTEGER,
  total_count INTEGER,
  time_taken_seconds INTEGER,
  ai_summary TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
    `;

    try {
        console.log("Running migration...");
        await client.query(sql);
        console.log("Migration successful!");
        await client.query("NOTIFY pgrst, reload_schema;"); // refresh postgrest cache
        console.log("Postgrest schema cache refreshed.");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
