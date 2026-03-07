const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { requireAuth } = require("@clerk/express");

router.get("/sessions", requireAuth(), chatController.getSessions);
router.post("/sessions", requireAuth(), chatController.createSession);
router.delete("/sessions/:id", requireAuth(), chatController.deleteSession);

router.post("/message", requireAuth(), chatController.sendMessage);
router.get("/history", requireAuth(), chatController.getHistory);
router.post("/quick-action", requireAuth(), chatController.quickAction);

module.exports = router;
