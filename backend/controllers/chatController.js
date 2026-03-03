const { chatWithCopilot } = require("../services/ai");
const supabase = require("../config/db");

// Get user's resume summary for context injection
async function getResumeContext(userId) {
    const { data } = await supabase
        .from("resumes")
        .select("summary, skills, primary_role, experience_years")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
    if (!data) return "";
    return `${data.primary_role}, ${data.experience_years} yrs exp. Skills: ${(data.skills || []).join(", ")}. ${data.summary}`;
}

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ message: "message is required" });

        // Get last 10 messages for context
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data: history } = await supabase
            .from("chatbot_messages")
            .select("role, content")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);

        const sortedHistory = (history || []).reverse();
        const resumeContext = await getResumeContext(userId);

        // Save user message
        await supabase.from("chatbot_messages").insert({
            user_id: userId, role: "user", content: message,
        });

        // Get AI response
        const response = await chatWithCopilot({
            message,
            history: sortedHistory,
            resumeContext,
        });

        // Save assistant response
        await supabase.from("chatbot_messages").insert({
            user_id: userId, role: "assistant", content: response,
        });

        res.json({ response });
    } catch (err) {
        console.error("[Chat]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data, error } = await supabase
            .from("chatbot_messages")
            .select("id, role, content, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: true })
            .limit(100);

        if (error) throw error;
        res.json({ messages: data || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.quickAction = async (req, res) => {
    try {
        const { action } = req.body;
        const prompts = {
            study_plan: "Generate a 4-week interview preparation study plan for me based on my background.",
            explain_results: "Explain my recent interview results and what I should focus on improving.",
            weak_points: "What are my coding weak points and how should I practice them?",
            hr_question: "Give me a practice HR/behavioral interview question and example answer using the STAR method.",
            focus_topics: "Based on my profile, what topics should I prioritize for my next interview?",
        };

        const message = prompts[action] || action;
        if (!message) return res.status(400).json({ message: "Unknown quick action" });

        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const resumeContext = await getResumeContext(userId);
        const response = await chatWithCopilot({ message, history: [], resumeContext });

        // Save both sides to history
        await supabase.from("chatbot_messages").insert([
            { user_id: userId, role: "user", content: message },
            { user_id: userId, role: "assistant", content: response },
        ]);

        res.json({ response });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
