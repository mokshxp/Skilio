const { body, query, param, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const { apiLogger } = require("../services/logger");

/**
 * Middleware to handle validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        console.error('[Validation Error] 400 Bad Request:', errorArray);
        // If apiLogger is available, use it
        if (typeof apiLogger !== 'undefined') {
            apiLogger.info(`[Validation Error] 400 Bad Request: ${JSON.stringify(errorArray)}`);
        }
        return res.status(400).json({ errors: errorArray });
    }
    next();
};

/**
 * Custom sanitizer for text fields to prevent XSS
 */
const sanitizeText = (value) => {
    if (typeof value !== 'string') return value;
    return sanitizeHtml(value, {
        allowedTags: [], // No HTML allowed in these text fields
        allowedAttributes: {},
        disallowedTagsMode: 'recursiveEscape'
    });
};

// ── Chat Validation ──────────────────────────────────────────
const chatSchemas = {
    sendMessage: [
        body("message")
            .isString().withMessage("Message must be a string")
            .trim()
            .notEmpty().withMessage("Message is required")
            .isLength({ max: 5000 }).withMessage("Message too long")
            .customSanitizer(sanitizeText),
        body("sessionId")
            .isString().withMessage("SessionId must be a string")
            .notEmpty().withMessage("SessionId is required")
            .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Invalid SessionId format"),
        validate
    ],
    createSession: [
        body("title")
            .optional()
            .isString().withMessage("Title must be a string")
            .trim()
            .isLength({ max: 100 }).withMessage("Title too long")
            .customSanitizer(sanitizeText),
        validate
    ],
    getHistory: [
        query("sessionId")
            .isString().withMessage("SessionId must be a string")
            .notEmpty().withMessage("SessionId is required")
            .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Invalid SessionId format"),
        validate
    ],
    quickAction: [
        body("action")
            .isString().withMessage("Action must be a string")
            .notEmpty().withMessage("Action is required")
            .isIn(['study_plan', 'explain_results', 'weak_points', 'hr_question', 'focus_topics'])
            .withMessage("Invalid action"),
        body("sessionId")
            .isString().withMessage("SessionId must be a string")
            .notEmpty().withMessage("SessionId is required"),
        validate
    ]
};

// ── Interview Validation ──────────────────────────────────────
const interviewSchemas = {
    startInterview: [
        // Support both role and targetRole for compatibility
        body(["role", "targetRole"])
            .optional()
            .isString().withMessage("Role must be a string")
            .trim(),
        body("difficulty")
            .trim().notEmpty().withMessage("Difficulty is required")
            .customSanitizer(v => v ? v.toLowerCase() : v)
            .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
            .withMessage("Invalid difficulty level"),
        body("roundType")
            .trim().notEmpty().withMessage("Round type is required")
            .customSanitizer(v => v ? v.toLowerCase() : v)
            .isIn(['technical', 'coding', 'behavioural', 'mixed', 'system_design'])
            .withMessage("Invalid round type"),
        body("resumeId")
            .optional({ nullable: true })
            .custom((val) => {
                if (!val) return true;
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(val)) return true;
                throw new Error("Invalid resumeId format");
            }),
        body("totalRounds")
            .optional()
            .isInt({ min: 1, max: 20 }).withMessage("totalRounds must be between 1 and 20"),
        validate
    ],
    submitAnswer: [
        body("question_id")
            .isUUID().withMessage("Invalid question_id format")
            .notEmpty().withMessage("question_id is required"),
        body("answer")
            .isString().withMessage("Answer must be a string")
            .trim().notEmpty().withMessage("Answer is required")
            .isLength({ max: 10000 }).withMessage("Answer too long")
            .customSanitizer(sanitizeText),
        validate
    ],
    getById: [
        param("id").isUUID().withMessage("Invalid session ID format"),
        validate
    ],
    listSessions: [
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
        validate
    ]
};

// ── Resume Validation ─────────────────────────────────────────
const resumeSchemas = {
    getById: [
        param("id").custom((val) => {
            if (val === 'latest') return true;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(val)) return true;
            throw new Error("Invalid resume ID format");
        }),
        validate
    ]
};

module.exports = {
    chatSchemas,
    interviewSchemas,
    resumeSchemas
};
