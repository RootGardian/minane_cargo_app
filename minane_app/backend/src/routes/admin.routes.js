const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// ─── Routes Administration Avancée (Zone Dangereuse) ─────────────────────────
// DELETE /api/admin/reset-data — Vide toutes les données opérationnelles
router.delete('/reset-data', authAdmin, adminController.resetData);

module.exports = router;

