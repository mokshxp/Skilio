const supabase = require("../config/db");

exports.getAnalytics = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

        // 1. Fetch user analytics aggregated stats
        const { data: analyticsRow, error: analyticsErr } = await supabase
            .from("user_analytics")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (analyticsErr && analyticsErr.code !== 'PGRST116') {
            console.error("Error fetching analytics:", analyticsErr);
        }

        // 2. Fetch last 10 interviews for score trend
        const { data: interviews, error: interviewsErr } = await supabase
            .from("interview_sessions")
            .select("start_time, final_score")
            .eq("user_id", userId)
            .eq("status", "completed")
            .order("start_time", { ascending: true })
            .limit(10);

        const scoreTrend = (interviews || []).map((s, i) => ({
            session: `S${i + 1}`,
            score: s.final_score ?? 0,
        }));

        // Provide defaults
        const stats = analyticsRow || {
            total_interviews: 0,
            average_score: 0,
            strongest_topics: [],
            weakest_topics: [],
            readiness_percentage: 0,
            success_rate_over_time: []
        };

        const weakTopics = Array.isArray(stats.weakest_topics) ? stats.weakest_topics : [];
        const topicStrength = Array.isArray(stats.strongest_topics) ? stats.strongest_topics : [];
        const codingSuccessRate = Array.isArray(stats.success_rate_over_time) ? stats.success_rate_over_time : [];

        res.json({
            total_sessions: stats.total_interviews || interviews?.length || 0,
            average_score: stats.average_score || 0,
            best_score: stats.average_score || 0, // Fallback if no best_score explicit field
            readiness_pct: stats.readiness_percentage || 0,
            score_trend: scoreTrend,
            coding_success_rate: codingSuccessRate,
            topic_strength: topicStrength.map(t => typeof t === 'string' ? { topic: t, score: 80 } : t),
            weak_topics: weakTopics.map(t => typeof t === 'string' ? { topic: t, score: 40 } : t),
        });
    } catch (err) {
        console.error("[Analytics]", err);
        res.status(500).json({ message: err.message });
    }
};
