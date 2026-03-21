require('dotenv').config();
const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = `
      -- Add missing columns to interviews table
      ALTER TABLE interviews ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 5;
      ALTER TABLE interviews ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1;
      
      -- Ensure interview_questions.interview_id is linked correctly
      -- (Assuming it might be pointing to wrong table or naming convention)
      
      -- Add any other missing MCQ columns to interview_questions if needed
      -- (Based on previous migration artifact)
      ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS subject TEXT;
      ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS topic TEXT;
      ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS difficulty TEXT;
      ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS options JSONB;
      ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
      ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
    `;

    await client.query(sql);
    console.log('Migration completed successfully.');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
