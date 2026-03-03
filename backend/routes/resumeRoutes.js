const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const { requireAuth } = require("@clerk/express");
const upload = require("../middleware/upload");

router.post("/upload", requireAuth(), upload.single("resume"), resumeController.uploadResume);
router.get("/:id", requireAuth(), resumeController.getResume);
router.get("/:id/structured", requireAuth(), resumeController.getStructuredResume);

module.exports = router;
