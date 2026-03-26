const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");
const { interviewSchemas } = require("../middleware/validator");

// V2 interview routes
router.post("/start", authMiddleware, interviewSchemas.startInterview, interviewController.startInterview);
router.post("/round/complete", authMiddleware, interviewController.completeRound);
router.post("/dsa/submit", authMiddleware, interviewController.submitDSA);
router.post("/dsa/run", authMiddleware, interviewController.runDSA);
router.get("/", authMiddleware, interviewSchemas.listSessions, interviewController.listInterviews);
router.get("/:id/results", authMiddleware, interviewController.getResults);
router.get("/session/:id", authMiddleware, interviewController.getSession);
router.get("/:id", authMiddleware, interviewController.getSession);
router.delete("/:id", authMiddleware, interviewController.deleteInterview);
router.post("/follow-up", authMiddleware, interviewController.evalFollowUp);

module.exports = router;
