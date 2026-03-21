require('dotenv').config();
const { Client } = require('pg');

async function runSubscriptionMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = `
      -- 1. Create Subscriptions table if missing
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
        payment_provider TEXT CHECK (payment_provider IN ('razorpay', 'stripe')),
        provider_subscription_id TEXT,
        provider_customer_id TEXT,
        current_period_start TIMESTAMPTZ,
        current_period_end TIMESTAMPTZ,
        cancel_at_period_end BOOLEAN DEFAULT false,
        interviews_used_this_month INTEGER DEFAULT 0,
        resume_uploads_this_month INTEGER DEFAULT 0,
        usage_reset_date TIMESTAMPTZ DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. Create usage_events table
      CREATE TABLE IF NOT EXISTS usage_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. Increment usage functions
      CREATE OR REPLACE FUNCTION increment_interview_usage(p_user_id TEXT)
      RETURNS void AS $$
      BEGIN
        INSERT INTO subscriptions (user_id, interviews_used_this_month)
        VALUES (p_user_id, 1)
        ON CONFLICT (user_id)
        DO UPDATE SET interviews_used_this_month = subscriptions.interviews_used_this_month + 1;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION increment_resume_usage(p_user_id TEXT)
      RETURNS void AS $$
      BEGIN
        INSERT INTO subscriptions (user_id, resume_uploads_this_month)
        VALUES (p_user_id, 1)
        ON CONFLICT (user_id)
        DO UPDATE SET resume_uploads_this_month = subscriptions.resume_uploads_this_month + 1;
      END;
      $$ LANGUAGE plpgsql;

      -- 4. RLS (Enable them even if not yet strictly enforced by backend, for dashboard safety)
      ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own subscription') THEN
              CREATE POLICY "Users can read own subscription" ON subscriptions FOR SELECT USING (user_id = auth.uid()::text);
          END IF;
      END $$;

      ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own events') THEN
              CREATE POLICY "Users can read own events" ON usage_events FOR SELECT USING (user_id = auth.uid()::text);
          END IF;
      END $$;
    `;

    await client.query(sql);
    console.log('Subscription migration completed successfully.');

  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await client.end();
  }
}

runSubscriptionMigration();
