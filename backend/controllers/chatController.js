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
    return `${data.primary_role || ''}, ${data.experience_years || 0} yrs exp. Skills: ${(data.skills || []).join(", ")}. ${data.summary || ''}`;
}

exports.getSessions = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const metaId = `SESSION_META:${userId}`;

        const { data, error } = await supabase
            .from("chatbot_messages")
            .select("id, message, created_at")
            .eq("user_id", metaId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        let sessions = [];
        for (let row of data || []) {
            try {
                const s = JSON.parse(row.message);
                s._db_id = row.id;
                if (s.id) sessions.push(s);
            } catch (e) { }
        }
        res.json({ sessions });
    } catch (err) {
        console.error("getSessions err", err);
        res.status(500).json({ message: err.message });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const metaId = `SESSION_META:${userId}`;
        const sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);

        const sessionObj = {
            id: sessionId,
            title: req.body.title || "New Conversation",
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from("chatbot_messages").insert({
            user_id: metaId,
            role: "user",
            message: JSON.stringify(sessionObj)
        });

        if (error) throw error;
        res.json({ session: sessionObj });
    } catch (err) {
        console.error("createSession err", err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { id: sessionId } = req.params;
        const metaId = `SESSION_META:${userId}`;

        const { data: metaRows } = await supabase.from("chatbot_messages").select("id, message").eq("user_id", metaId);
        let rowToDelete = null;
        for (let row of metaRows || []) {
            try {
                const s = JSON.parse(row.message);
                if (s.id === sessionId) rowToDelete = row.id;
            } catch (e) { }
        }

        if (rowToDelete) {
            await supabase.from("chatbot_messages").delete().eq("id", rowToDelete);
        }

        await supabase.from("chatbot_messages").delete().eq("user_id", `${userId}:${sessionId}`);

        res.json({ success: true });
    } catch (err) {
        console.error("deleteSession err", err);
        res.status(500).json({ message: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!message?.trim()) return res.status(400).json({ message: "message is required" });
        if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const sessionUserId = `${userId}:${sessionId}`;

        const { data: history } = await supabase
            .from("chatbot_messages")
            .select("role, message")
            .eq("user_id", sessionUserId)
            .order("created_at", { ascending: false })
            .limit(10);

        const mappedHistory = (history || []).map(m => ({ role: m.role, content: m.message })).reverse();
        const resumeContext = await getResumeContext(userId);

        const { error: userErr } = await supabase.from("chatbot_messages").insert({
            user_id: sessionUserId, role: "user", message: message,
        });
        if (userErr) console.warn("Supabase logic error inserting user message:", userErr);

        const response = await chatWithCopilot({
            message,
            history: mappedHistory,
            resumeContext,
        });

        const { error: aiErr } = await supabase.from("chatbot_messages").insert({
            user_id: sessionUserId, role: "assistant", message: response,
        });
        if (aiErr) console.warn("Supabase log error inserting AI message:", aiErr);

        if (!history || history.length === 0) {
            const metaId = `SESSION_META:${userId}`;
            const { data: metaRows } = await supabase.from("chatbot_messages").select("id, message").eq("user_id", metaId);
            for (let row of metaRows || []) {
                try {
                    const s = JSON.parse(row.message);
                    if (s.id === sessionId && s.title === "New Conversation") {
                        s.title = message.substring(0, 30) + (message.length > 30 ? "..." : "");
                        await supabase.from("chatbot_messages").update({ message: JSON.stringify(s) }).eq("id", row.id);
                        break;
                    }
                } catch (e) { }
            }
        }

        res.json({ response });
    } catch (err) {
        console.error("[Chat]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const sessionId = req.query.sessionId;
        if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

        const sessionUserId = `${userId}:${sessionId}`;

        const { data, error } = await supabase
            .from("chatbot_messages")
            .select("id, role, message, created_at")
            .eq("user_id", sessionUserId)
            .order("created_at", { ascending: true })
            .limit(100);

        if (error) throw error;

        const messages = (data || []).map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.message,
            created_at: msg.created_at
        }));

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.quickAction = async (req, res) => {
    try {
        const { action, sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

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
        const sessionUserId = `${userId}:${sessionId}`;
        const resumeContext = await getResumeContext(userId);

        const { data: history } = await supabase
            .from("chatbot_messages")
            .select("role, message")
            .eq("user_id", sessionUserId)
            .order("created_at", { ascending: false })
            .limit(10);
        const mappedHistory = (history || []).map(m => ({ role: m.role, content: m.message })).reverse();

        const response = await chatWithCopilot({ message, history: mappedHistory, resumeContext });

        await supabase.from("chatbot_messages").insert([
            { user_id: sessionUserId, role: "user", message: message },
            { user_id: sessionUserId, role: "assistant", message: response },
        ]);

        if (!history || history.length === 0) {
            const metaId = `SESSION_META:${userId}`;
            const { data: metaRows } = await supabase.from("chatbot_messages").select("id, message").eq("user_id", metaId);
            for (let row of metaRows || []) {
                try {
                    const s = JSON.parse(row.message);
                    if (s.id === sessionId && s.title === "New Conversation") {
                        let t = action.replace(/_/g, ' ');
                        s.title = "Quick Action: " + t.charAt(0).toUpperCase() + t.slice(1);
                        await supabase.from("chatbot_messages").update({ message: JSON.stringify(s) }).eq("id", row.id);
                        break;
                    }
                } catch (e) { }
            }
        }

        res.json({ response });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
