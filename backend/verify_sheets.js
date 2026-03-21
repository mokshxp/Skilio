require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
    const { data, error } = await supabase
        .from('interview_sheets')
        .select('id')
        .limit(1);
    
    if (error) {
        console.error("❌ interview_sheets missing or error:", error.message);
    } else {
        console.log("✅ interview_sheets table EXISTS!");
    }

    const { data: data2, error: error2 } = await supabase
        .from('user_sheet_progress')
        .select('id')
        .limit(1);
    
    if (error2) {
        console.error("❌ user_sheet_progress missing or error:", error2.message);
    } else {
        console.log("✅ user_sheet_progress table EXISTS!");
    }
}

checkTables();
