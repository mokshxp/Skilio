const express = require('express');
const router = express.Router();
const sheetController = require('../controllers/sheetController');
const { requireAuth } = require('@clerk/express');

// Publicly visible sheets (filtered by is_published in controller/RLS)
router.get('/list', sheetController.listSheets);
router.get('/:slug', sheetController.getSheetBySlug);

// User-specific progress (Protected)
router.get('/progress/:sheetId', requireAuth(), sheetController.getSheetProgress);
router.post('/progress/:sheetId/complete', requireAuth(), sheetController.updateProgress);
router.post('/progress/:sheetId/bookmark', requireAuth(), sheetController.toggleBookmark);

module.exports = router;
