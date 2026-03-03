const { extractText } = require("../services/resumeParser");
const { analyzeResume } = require("../services/ai");
const supabase = require("../config/db");

const pdf = require("pdf-parse");

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { userId } = authData || {};

        // Extract text from PDF or DOCX
        const extractedText = await extractText(req.file.buffer, req.file.mimetype);

        // Parse resume using AI
        const parsed = await analyzeResume(extractedText);

        const { error } = await supabase
            .from("resumes")
            .insert({
                user_id: userId,
                raw_text: extractedText,
                summary: parsed.summary,
                skills: parsed.skills,
                experience_years: parsed.experience_years,
                primary_role: parsed.primary_role,
                education: parsed.education,
                key_projects: parsed.key_projects
            });

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ error: "Failed to save resume to database" });
        }

        return res.json({
            success: true,
            userId,
            textLength: extractedText.length,
            preview: extractedText.substring(0, 500),
            structured: parsed
        });

    } catch (error) {
        console.error("PDF extraction error:", error);
        return res.status(500).json({ error: "Failed to extract resume text" });
    }
};

exports.getResume = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data, error } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return res.status(404).json({ message: "No resume found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStructuredResume = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data, error } = await supabase
            .from("resumes")
            .select("skills, summary, experience_years, primary_role, education, key_projects")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return res.status(404).json({ message: "No resume found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
