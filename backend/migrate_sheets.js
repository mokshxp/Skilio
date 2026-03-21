/**
 * Migration script to create interview_sheets and user_sheet_progress tables.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
-- Create interview_sheets table
CREATE TABLE IF NOT EXISTS interview_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  content JSONB NOT NULL,
  tags TEXT[],
  estimated_read_time INTEGER,
  is_published BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sheet_progress table
CREATE TABLE IF NOT EXISTS user_sheet_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  sheet_id UUID REFERENCES interview_sheets(id) ON DELETE CASCADE,
  is_bookmarked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  progress_percent INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sheet_id)
);

-- Enable RLS
ALTER TABLE interview_sheets ENABLE ROW LEVEL SECURITY;
-- Dropping first to avoid conflicts if re-running
DROP POLICY IF EXISTS "Published sheets visible to all" ON interview_sheets;
CREATE POLICY "Published sheets visible to all"
  ON interview_sheets FOR SELECT
  USING (is_published = true);

ALTER TABLE user_sheet_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own progress" ON user_sheet_progress;
CREATE POLICY "Users manage own progress"
  ON user_sheet_progress
  USING (user_id = auth.uid()::text);
`;

async function migrate() {
    console.log("🚀 Starting Sheets migration...");

    // Try executing via RPC exec_sql (common Supabase pattern)
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error("❌ Migration failed via RPC:", error.message);
        console.log("\nIf 'exec_sql' RPC is missing, please run the SQL manually in Supabase SQL Editor:\n");
        console.log(sql);
    } else {
        console.log("✅ Tables created and RLS enabled successfully.");
    }
}

migrate().catch(err => {
    console.error("💥 Unhandled error:", err);
});
