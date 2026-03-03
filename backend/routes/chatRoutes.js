const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { requireAuth } = require("@clerk/express");

router.post("/message", requireAuth(), chatController.sendMessage);
router.get("/history", requireAuth(), chatController.getHistory);
router.post("/quick-action", requireAuth(), chatController.quickAction);

module.exports = router;
