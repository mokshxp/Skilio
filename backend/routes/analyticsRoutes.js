const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { requireAuth } = require("@clerk/express");

router.get("/", requireAuth(), analyticsController.getAnalytics);

module.exports = router;
