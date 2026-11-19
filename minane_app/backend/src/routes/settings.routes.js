const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const settingsController = require('../controllers/settings.controller');

// ─── Routes Paramètres & Coordonnées (MVC Architecture) ─────────────────────
router.get('/', settingsController.get);
router.put('/', authAdmin, settingsController.update);

module.exports = router;
