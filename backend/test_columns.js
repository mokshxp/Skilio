require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    const { data, error } = await supabase.from("chatbot_messages").select("*").limit(1);
    console.log(error || data);
})();
