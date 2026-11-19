const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');

// ─── Routes Suivi Public (MVC Architecture) ─────────────────────────────────
router.get('/:code', trackingController.track);

module.exports = router;
