const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// ─── Routes Authentification Direction (MVC Architecture) ───────────────────
router.post('/admin/login', authController.loginAdmin);
router.get('/admin/me', authAdmin, authController.getMe);

module.exports = router;
