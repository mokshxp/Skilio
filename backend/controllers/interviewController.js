const { generateQuestion, scoreAnswer, generateInterviewSummary } = require("../services/ai");
const supabase = require("../config/db");

// Helper: get user's resume context for personalized questions
async function getResumeContext(userId) {
    const { data } = await supabase
        .from("resumes")
        .select("summary, skills, primary_role, experience_years")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (!data) return "";
    return `${data.primary_role} with ${data.experience_years} years experience. Skills: ${(data.skills || []).join(", ")}. ${data.summary}`;
}

exports.startInterview = async (req, res) => {
    try {
        const { role, difficulty, round_type = "technical" } = req.body;
        if (!role || !difficulty) return res.status(400).json({ message: "role and difficulty are required" });

        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const resumeContext = await getResumeContext(userId);

        // Create interview session in Supabase
        const { data: session, error: sessionErr } = await supabase
            .from("interview_sessions")
            .insert({
                user_id: userId,
                role,
                difficulty,
                round_type,
                status: "in_progress",
                resume_context: resumeContext,
            })
            .select()
            .single();

        if (sessionErr) throw sessionErr;

        // Generate first question
        const questionData = await generateQuestion({
            role, difficulty, roundType: round_type, resumeContext,
        });

        // Save question to Supabase
        const { data: question, error: qErr } = await supabase
            .from("questions")
            .insert({
                interview_id: session.id,
                content: questionData.question,
                type: questionData.type,
                hint: questionData.hint,
                expected_topics: questionData.expected_topics,
                time_limit_seconds: questionData.time_limit_seconds,
                question_number: 1,
            })
            .select()
            .single();

        if (qErr) throw qErr;

        res.status(201).json({
            interviewId: session.id,
            message: "Interview started",
            currentQuestion: {
                id: question.id,
                number: 1,
                content: question.content,
                type: question.type,
                hint: question.hint,
                time_limit_seconds: question.time_limit_seconds,
            },
        });
    } catch (err) {
        console.error("[Start Interview]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getSession = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data: session, error } = await supabase
            .from("interview_sessions")
            .select("*, questions(*)")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .single();

        if (error || !session) return res.status(404).json({ message: "Interview session not found" });

        const questions = session.questions || [];
        const answered = questions.filter((q) => q.answer != null);
        const current = questions.find((q) => q.answer == null);

        res.json({
            interviewId: session.id,
            role: session.role,
            difficulty: session.difficulty,
            round_type: session.round_type,
            status: session.status,
            total_questions: questions.length,
            answered_count: answered.length,
            currentQuestion: current
                ? {
                    id: current.id,
                    number: current.question_number,
                    content: current.content,
                    type: current.type,
                    hint: current.hint,
                    time_limit_seconds: current.time_limit_seconds,
                }
                : null,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const { question_id, answer } = req.body;
        if (!question_id || !answer) return res.status(400).json({ message: "question_id and answer are required" });

        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

        // Get the question and verify ownership
        const { data: question, error: qErr } = await supabase
            .from("questions")
            .select("*, interview_sessions(user_id, role, difficulty, round_type)")
            .eq("id", question_id)
            .single();
        if (qErr || !question) return res.status(404).json({ message: "Question not found" });

        // Verify the question belongs to the authenticated user
        if (question.interview_sessions.user_id !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const { role, difficulty, round_type } = question.interview_sessions;

        // Score with AI
        const evaluation = await scoreAnswer({
            question: question.content,
            answer,
            roundType: round_type,
            role,
            difficulty,
        });

        // Save answer + score to question
        await supabase.from("questions").update({
            answer,
            score: evaluation.score,
            feedback: evaluation.feedback,
            improvements: evaluation.improvements,
            topics_covered: evaluation.topics_covered,
            topics_missed: evaluation.topics_missed,
        }).eq("id", question_id);

        // Get all questions to decide if we should generate next question
        const { data: allQuestions } = await supabase
            .from("questions")
            .select("content, score")
            .eq("interview_id", question.interview_id)
            .order("question_number", { ascending: true });

        const unanswered = allQuestions.filter((q) => q.score == null);
        const questionCount = allQuestions.length;

        let nextQuestion = null;

        // Continue interview up to 5 questions
        if (questionCount < 5) {
            const previousQuestions = allQuestions.map((q) => q.content);
            const resumeContext = await getResumeContext(userId);

            const nextQData = await generateQuestion({
                role, difficulty, roundType: round_type, resumeContext, previousQuestions,
            });

            const { data: nq } = await supabase.from("questions").insert({
                interview_id: question.interview_id,
                content: nextQData.question,
                type: nextQData.type,
                hint: nextQData.hint,
                expected_topics: nextQData.expected_topics,
                time_limit_seconds: nextQData.time_limit_seconds,
                question_number: questionCount + 1,
            }).select().single();

            nextQuestion = {
                id: nq.id,
                number: nq.question_number,
                content: nq.content,
                type: nq.type,
                hint: nq.hint,
                time_limit_seconds: nq.time_limit_seconds,
            };
        }

        res.json({
            score: evaluation.score,
            feedback: evaluation.feedback,
            improvements: evaluation.improvements,
            nextQuestion,
            interviewComplete: !nextQuestion,
        });
    } catch (err) {
        console.error("[Submit Answer]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.nextRound = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data: session } = await supabase
            .from("interview_sessions")
            .select("round_type")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .single();

        if (!session) return res.status(404).json({ message: "Session not found" });

        const roundProgression = { technical: "coding", coding: "system_design", system_design: "behavioral" };
        const nextRound = roundProgression[session?.round_type] || "behavioral";

        const resumeContext = await getResumeContext(userId);
        const nextQData = await generateQuestion({
            role: req.body.role || "Software Engineer",
            difficulty: req.body.difficulty || "Intermediate",
            roundType: nextRound,
            resumeContext,
        });

        res.json({ nextRound, question: nextQData.question, type: nextQData.type });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.endInterview = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

        // Verify ownership before ending
        const { data: ownerCheck } = await supabase
            .from("interview_sessions")
            .select("id")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .single();
        if (!ownerCheck) return res.status(404).json({ message: "Session not found" });

        const { data: questions, error } = await supabase
            .from("questions")
            .select("content, answer, score")
            .eq("interview_id", req.params.id);

        if (error) throw error;

        const scored = questions.filter((q) => q.score != null);
        const totalScore = scored.length
            ? Math.round(scored.reduce((s, q) => s + q.score, 0) / scored.length)
            : 0;

        const { data: session } = await supabase
            .from("interview_sessions")
            .select("role")
            .eq("id", req.params.id)
            .single();

        // Generate AI summary
        const summary = await generateInterviewSummary({
            questions: questions.map((q) => q.content),
            answers: questions.map((q) => q.answer),
            scores: questions.map((q) => q.score),
            role: session?.role || "Software Engineer",
        });

        // Update interview as completed
        await supabase.from("interview_sessions").update({
            status: "completed",
            total_score: totalScore,
            ai_feedback_summary: summary.ai_feedback_summary,
            weak_topics: summary.weak_topics,
            recommendation: summary.recommendation,
        }).eq("id", req.params.id);

        res.json({ message: "Interview completed", total_score: totalScore, summary });
    } catch (err) {
        console.error("[End Interview]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getResults = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data: session, error } = await supabase
            .from("interview_sessions")
            .select("*, questions(*)")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .single();

        if (error || !session) return res.status(404).json({ message: "Interview not found" });

        const questions = session.questions || [];
        const scored = questions.filter((q) => q.score != null);

        res.json({
            interviewId: session.id,
            total_score: session.total_score,
            role: session.role,
            difficulty: session.difficulty,
            round_type: session.round_type,
            status: session.status,
            ai_feedback_summary: session.ai_feedback_summary,
            weak_topics: session.weak_topics || [],
            rounds: [{
                round_type: session.round_type,
                score: session.total_score,
                question_count: questions.length,
                feedback: session.ai_feedback_summary,
            }],
            questions: scored.map((q) => ({
                content: q.content,
                answer: q.answer,
                score: q.score,
                feedback: q.feedback,
                improvements: q.improvements,
            })),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.listSessions = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const limit = parseInt(req.query.limit) || 20;

        const { data: sessions, error } = await supabase
            .from("interview_sessions")
            .select("*")
            .eq("user_id", userId)
            .order("start_time", { ascending: false })
            .limit(limit);

        if (error) throw error;
        res.json({ sessions: sessions || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
