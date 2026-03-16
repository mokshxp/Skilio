require("dotenv").config();
const express = require("express");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const codingRoutes = require("./routes/codingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const listEndpoints = require("express-list-endpoints");

const app = express();
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);

const endpoints = listEndpoints(app);
console.log(JSON.stringify(endpoints, null, 2));
