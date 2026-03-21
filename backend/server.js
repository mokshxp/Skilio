require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const slowDown = require("express-slow-down");
const morgan = require("morgan");
const http = require("http");

const { logger, securityLogger, apiLogger } = require("./services/logger");
const { clerkMiddleware } = require("@clerk/express");
const { setupWebSocket } = require("./services/websocketService");

const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const codingRoutes = require("./routes/codingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const sheetRoutes = require("./routes/sheetRoutes");

const app = express();

// ── Deployment & Proxy Hardening ───────────────────────────────
// Trust the first proxy (Vercel, Cloudflare, etc.) for accurate IP rate limiting
app.set("trust proxy", 1);

// Enforce HTTPS in production (Vercel/Cloudflare usually handle this, but better to be safe)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// ── Structured Logging ───────────────────────────────────────
app.use(morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) }
}));
// TRACE: Global debug tracer
app.use((req, res, next) => {
    console.log(`[DEBUG_TRACE] ${req.method} ${req.originalUrl}`);
    apiLogger.info(`[DEBUG_TRACE] ${req.method} ${req.originalUrl}`);
    next();
});

// ── Security Headers ─────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://clerk.skilio.com", "*.clerk.accounts.dev"],
            "connect-src": ["'self'", "https://clerk.skilio.com", "*.clerk.accounts.dev", "*.supabase.co", "wss://*.supabase.co"],
            "img-src": ["'self'", "data:", "https://img.clerk.com"],
        }
    },
    crossOriginEmbedderPolicy: false
}));
app.use(hpp());

// ── CORS — restrict to known origins ─────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL, 
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://skilio.vercel.app"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            securityLogger.warn(`CORS BLOCK: Unauthorized origin ${origin}`);
            return callback(null, false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// ── Abuse Protection & Rate Limiting ────────────────────────
const rateLimitHandler = (req, res, next, options) => {
    securityLogger.warn(`RATE_LIMIT_HIT: ${req.ip} reached limit for ${req.originalUrl}`);
    res.status(options.statusCode).json({ error: options.message });
}

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: (hits) => (hits - 100) * 500,
    maxDelayMs: 20000,
});
app.use(speedLimiter);

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Too many requests. Please slow down.",
    handler: rateLimitHandler
});
app.use(generalLimiter);

const aiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 20, 
    message: "AI generation limit reached. Please wait a few minutes.",
    handler: rateLimitHandler
});

app.use("/chat", aiLimiter);
app.use("/interview/start", aiLimiter);
app.use("/coding", aiLimiter);

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: "Too many upload attempts. Please wait.",
    handler: rateLimitHandler
});
app.use("/resume/upload", uploadLimiter);

const scrapingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Data limit exceeded. Please don't scrape our data.",
    handler: rateLimitHandler
});
app.use("/analytics", scrapingLimiter);
app.use("/sheets", scrapingLimiter);

// ── Auth ─────────────────────────────────────────────────────
app.use(clerkMiddleware());

const subscriptionRoutes = require("./routes/subscriptionRoutes");

// ── Routes ───────────────────────────────────────────────────
app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/coding", codingRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/chat", chatRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/sheets", sheetRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// 404 Handler
app.use((req, res) => {
    apiLogger.info(`404_NOT_FOUND: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler — Enhanced
app.use((err, req, res, next) => {
    if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
    }

    const status = err.status || err.statusCode || 500;
    
    logger.error(`UNHANDLED_ERROR: ${err.message}`, { 
        stack: err.stack, 
        path: req.originalUrl,
        ip: req.ip,
        status: status
    });

    res.status(status).json({
        error: "Server Error",
        message: err.message, // Returning the message during debugging
        code: err.code || err.name,
        details: err.details || err.detail,
        hint: err.hint
    });
});

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    logger.info(`⚡ Skilio API Engine active on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});
