const express = require("express");
const router = express.Router();
const codingController = require("../controllers/codingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate-problem", authMiddleware, codingController.generateProblem);
router.post("/submit", authMiddleware, codingController.submitCode);
router.get("/problem/:id", authMiddleware, codingController.getProblem);
router.get("/submission/:id", authMiddleware, codingController.getSubmission);

module.exports = router;
