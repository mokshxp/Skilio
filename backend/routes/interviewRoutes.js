const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, interviewController.listSessions);
router.post("/start", authMiddleware, interviewController.startInterview);
router.get("/:id", authMiddleware, interviewController.getSession);
router.post("/:id/next-round", authMiddleware, interviewController.nextRound);
router.post("/:id/submit-answer", authMiddleware, interviewController.submitAnswer);
router.post("/:id/end", authMiddleware, interviewController.endInterview);
router.get("/:id/results", authMiddleware, interviewController.getResults);

module.exports = router;
