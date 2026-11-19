const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

// ─── Routes Caisse & Règlements (MVC Architecture) ──────────────────────────
router.post('/', authAdmin, paymentController.recordPayment);
router.get('/receivables', authAdmin, paymentController.getReceivables);
router.get('/recent', authAdmin, paymentController.getRecent);

module.exports = router;
