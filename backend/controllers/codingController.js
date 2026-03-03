const { generateCodingProblem, evaluateCode } = require("../services/ai");
const supabase = require("../config/db");

exports.generateProblem = async (req, res) => {
    try {
        const { role = "Software Engineer", difficulty = "Medium", topics = [] } = req.body;
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

        const problem = await generateCodingProblem({ role, difficulty, topics });

        // Save problem to Supabase
        const { data, error } = await supabase
            .from("coding_problems")
            .insert({
                user_id: userId,
                title: problem.title,
                description: problem.description,
                constraints: problem.constraints,
                examples: problem.examples,
                starter_code: problem.starter_code,
                difficulty: problem.difficulty,
                topics: problem.topics,
                time_limit_seconds: problem.time_limit_seconds,
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ problemId: data.id, ...problem });
    } catch (err) {
        console.error("[Generate Problem]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.submitCode = async (req, res) => {
    try {
        const { code, language, problemId } = req.body;
        if (!code || !language) return res.status(400).json({ message: "code and language are required" });

        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;

        // Get problem context
        let problem = "Solve the given coding problem";
        if (problemId) {
            const { data } = await supabase
                .from("coding_problems")
                .select("title, description")
                .eq("id", problemId)
                .single();
            if (data) problem = `${data.title}: ${data.description}`;
        }

        // Evaluate with AI
        const result = await evaluateCode({ problem, code, language });

        // Save submission
        const { data: submission, error } = await supabase
            .from("code_submissions")
            .insert({
                user_id: userId,
                problem_id: problemId || null,
                code,
                language,
                status: result.status,
                score: result.score,
                feedback: result.feedback,
                runtime_estimate: result.runtime_estimate,
                test_cases_passed: result.test_cases_passed,
                test_cases_total: result.test_cases_total,
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            submissionId: submission.id,
            status: result.status,
            score: result.score,
            runtime: result.runtime_estimate,
            test_cases_passed: result.test_cases_passed,
            test_cases_total: result.test_cases_total,
            feedback: result.feedback,
            improvements: result.improvements,
            optimized_approach: result.optimized_approach,
        });
    } catch (err) {
        console.error("[Submit Code]", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getProblem = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data, error } = await supabase
            .from("coding_problems")
            .select("*")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .single();

        if (error || !data) return res.status(404).json({ message: "Problem not found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSubmission = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data, error } = await supabase
            .from("code_submissions")
            .select("*")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .single();

        if (error || !data) return res.status(404).json({ message: "Submission not found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
