const { extractText } = require("../services/resumeParser");
const { analyzeResume } = require("../services/ai");
const supabase = require("../config/db");

exports.uploadResume = async (req, res) => {
    try {
        console.log("---- Resume Upload Hit ----");
        console.log("File object:", req.file ? { name: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : "UNDEFINED");

        if (!req.file) {
            console.error("❌ req.file is undefined — multer did not process the file");
            return res.status(400).json({ error: "No file uploaded" });
        }

        const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { userId } = authData || {};
        console.log("Auth userId:", userId);

        // Extract text from PDF or DOCX
        console.log("Extracting text from", req.file.mimetype, "buffer size:", req.file.buffer?.length);
        const extractedText = await extractText(req.file.buffer, req.file.mimetype);
        console.log("✅ Extracted text length:", extractedText.length);
        console.log("Preview:", extractedText.substring(0, 300));

        if (!extractedText || extractedText.trim().length < 50) {
            console.error("❌ Extracted text too short — likely a scanned/image PDF");
            return res.status(400).json({ error: "Could not extract enough text. Please upload a text-based PDF or Word document." });
        }

        // Parse resume using AI
        console.log("Sending to NVIDIA Qwen for analysis...");
        const parsed = await analyzeResume(extractedText);
        console.log("✅ AI analysis complete:", JSON.stringify(parsed).substring(0, 300));

        const { data: insertedResume, error } = await supabase
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
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Supabase insert error:", error);
            return res.status(500).json({ error: "Failed to save resume to database" });
        }

        console.log("✅ Resume saved to database for user:", userId, "ID:", insertedResume.id);

        return res.json({
            success: true,
            id: insertedResume.id,
            userId,
            textLength: extractedText.length,
            preview: extractedText.substring(0, 500),
            structured: parsed
        });

    } catch (error) {
        console.error("❌ Resume upload error:", error);
        return res.status(500).json({ error: "Failed to extract resume text" });
    }
};

exports.listResumes = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { data, error } = await supabase
            .from("resumes")
            .select("id, summary, primary_role, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ message: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getResume = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        let query = supabase.from("resumes").select("*").eq("user_id", userId);

        if (req.params.id && req.params.id !== 'latest') {
            query = query.eq("id", req.params.id);
        } else {
            query = query.order("created_at", { ascending: false }).limit(1);
        }

        const { data, error } = await query.single();
        if (error || !data) return res.status(404).json({ message: "No resume found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { id } = req.params;

        console.log(`[ResumeDelete] Attempting to delete resume ${id} for user ${userId}`);

        // 1. Nullify references in BOTH possible interview tables
        const tablesToClear = ["interviews", "interview_sessions"];
        for (const table of tablesToClear) {
            const { error: updateError } = await supabase
                .from(table)
                .update({ resume_id: null })
                .eq("resume_id", id)
                .eq("user_id", userId);

            if (updateError) {
                console.warn(`[ResumeDelete] Warning nullifying ${table}:`, updateError.message);
            }
        }

        // 2. Delete the actual record
        const { error } = await supabase
            .from("resumes")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

        if (error) {
            console.error("[ResumeDelete] Error deleting resume:", error);
            return res.status(500).json({ message: `Database error: ${error.message}` });
        }

        console.log(`[ResumeDelete] Successfully deleted resume ${id}`);
        res.json({ message: "Resume deleted successfully" });
    } catch (err) {
        console.error("[ResumeDelete] Exception:", err);
        res.status(500).json({ message: `Internal server error: ${err.message}` });
    }
};

exports.touchResume = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        const { id } = req.params;

        const { error } = await supabase
            .from("resumes")
            .update({ created_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", userId);

        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: "Resume active now" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStructuredResume = async (req, res) => {
    try {
        const { userId } = typeof req.auth === 'function' ? req.auth() : req.auth;
        let query = supabase.from("resumes").select("skills, summary, experience_years, primary_role, education, key_projects").eq("user_id", userId);

        if (req.params.id && req.params.id !== 'latest') {
            query = query.eq("id", req.params.id);
        } else {
            query = query.order("created_at", { ascending: false }).limit(1);
        }

        const { data, error } = await query.single();

        if (error || !data) return res.status(404).json({ message: "No resume found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
