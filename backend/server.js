require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const codingRoutes = require("./routes/codingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");

const { clerkMiddleware } = require("@clerk/express");

const http = require("http");
const { setupWebSocket } = require("./services/websocketService");

const app = express();

// ── Security Headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS — restrict to known origins ─────────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    // TODO: add your production domain here
    // "https://your-app.com",
];
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return cb(null, true);
        }
        console.warn(`[CORS] Rejected origin: ${origin}`);
        cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

// ── Body parsing with explicit size limit ────────────────────
app.use(express.json({ limit: "1mb" }));

// ── Rate Limiting ────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});
app.use(generalLimiter);

// Stricter limits for AI-powered endpoints (cost protection)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: { error: "AI rate limit reached. Please wait before retrying." },
});
app.use("/chat", aiLimiter);
app.use("/interview", aiLimiter);
app.use("/coding", aiLimiter);

// Strict limit for uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Upload rate limit reached. Please wait before retrying." },
});
app.use("/resume", uploadLimiter);

// ── Auth ─────────────────────────────────────────────────────
app.use(clerkMiddleware());

app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/coding", codingRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/chat", chatRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// global error handler to resolve HTML 500/413 errors
app.use((err, req, res, next) => {
    if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
    }

    // Clerk unauthorized error
    if (err.message === 'Unauthenticated' || err.statusCode === 401) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    console.error("❌ Global error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal server error"
    });
});


const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    require('express-list-endpoints')(app).forEach(r => console.log(r.path, r.methods));
});

