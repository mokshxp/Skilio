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

// Get detailed interview context for context injection
async function getInterviewContext(userId, interviewId) {
    if (!interviewId) return "";
    try {
        console.log(`[Chat Context] Fetching interview ${interviewId} for user ${userId}`);
        const { data: interview, error } = await supabase
            .from("interviews")
            .select("*, interview_questions(*), interview_responses(*), interview_round_summaries(*)")
            .eq("id", interviewId)
            .eq("user_id", userId)
            .single();

        if (error || !interview) {
            console.warn(`[Chat Context] No data found for interviewId: ${interviewId}`);
            return "";
        }

        let context = `\n--- START SPECIFIC INTERVIEW DATA (ID: ${interviewId}) ---\n`;
        context += `Session Role: ${interview.target_role}, Overall Status: ${interview.status}, Type: ${interview.type}\n`;
        context += `Final Score/PPS: ${interview.pps_score || interview.score || 'N/A'}\n\n`;

        if (interview.interview_round_summaries && interview.interview_round_summaries.length > 0) {
            context += "PERFORMANCE BY ROUND:\n";
            interview.interview_round_summaries.sort((a,b) => a.round_number - b.round_number).forEach(s => {
                context += `- Round ${s.round_number} (${s.round_type}): Grade: ${s.score}/10. Summary: ${s.ai_summary || ''}\n`;
            });
            context += "\n";
        }

        if (interview.interview_questions && interview.interview_questions.length > 0) {
            context += "DETAILED Q&A LOG:\n";
            // Map responses for easy lookup
            const responseMap = (interview.interview_responses || []).reduce((acc, r) => {
                acc[r.question_id] = r;
                return acc;
            }, {});

            interview.interview_questions.forEach((q, i) => {
                const resp = responseMap[q.id];
                context += `[${q.round_number}] Q: ${q.question_text}\n`;
                if (q.question_type === 'mcq') {
                    context += `   Choice A: ${q.options?.A || 'N/A'}\n   Choice B: ${q.options?.B || 'N/A'}\n   Choice C: ${q.options?.C || 'N/A'}\n   Choice D: ${q.options?.D || 'N/A'}\n`;
                    context += `   Correct: ${q.correct_answer}\n`;
                }
                context += `   User Provided: ${resp?.user_answer || resp?.selected_option || 'No Response'}\n`;
                if (resp) {
                    context += `   Evaluation: ${resp.is_correct ? 'CORRECT' : 'INCORRECT'}, Score: ${(resp.score || 0) * 10}/10\n`;
                    context += `   AI Feedback: ${resp.ai_feedback || 'N/A'}\n`;
                }
                context += "---\n";
            });
        }
        context += `--- END SPECIFIC INTERVIEW DATA ---\n`;
        return context;
    } catch (err) {
        console.error("getInterviewContext err", err);
        return "";
    }
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

        // EXTRACTION: Detect Interview IDs in current message or recent history
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        let match = message.match(uuidRegex);
        
        // Context persistence: check last 2 user messages if first one fails
        if (!match && mappedHistory.length > 0) {
            for (let i = mappedHistory.length - 1; i >= Math.max(0, mappedHistory.length - 3); i--) {
                if (mappedHistory[i].role === 'user') {
                    const hMatch = mappedHistory[i].content.match(uuidRegex);
                    if (hMatch) {
                        match = hMatch;
                        break;
                    }
                }
            }
        }

        let interviewContext = "";
        if (match && match[0]) {
            const interviewId = match[0].trim();
            interviewContext = await getInterviewContext(userId, interviewId);
        }

        const { error: userErr } = await supabase.from("chatbot_messages").insert({
            user_id: sessionUserId, role: "user", message: message,
        });
        if (userErr) console.warn("Supabase logic error inserting user message:", userErr);

        const response = await chatWithCopilot({
            message,
            history: mappedHistory,
            resumeContext,
            interviewContext, // Full technical drill-down
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

        // Check for interview ID in the prompt
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = message.match(uuidRegex);
        let interviewContext = "";
        if (match) {
            interviewContext = await getInterviewContext(userId, match[0]);
        }

        const response = await chatWithCopilot({ message, history: mappedHistory, resumeContext, interviewContext });

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
