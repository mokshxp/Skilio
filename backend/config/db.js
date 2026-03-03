const { createClient } = require("@supabase/supabase-js");

// ⚠️  SECURITY NOTE: This uses the SERVICE ROLE KEY, which bypasses
//    all Row-Level Security (RLS) policies. This means the application
//    code is the ONLY access control layer.
//
//    TODO: For production, migrate to using the anon key with per-user
//    JWTs so that Supabase RLS enforces data isolation at the DB level:
//
//    1. Enable RLS on all tables in Supabase Dashboard
//    2. Add policies like: auth.uid() = user_id
//    3. Create a per-request client using the user's JWT:
//       createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
//         global: { headers: { Authorization: `Bearer ${userJwt}` } }
//       })
//    4. Reserve this service role client for admin-only operations
//
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
