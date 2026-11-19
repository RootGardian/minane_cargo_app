const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const clientController = require('../controllers/client.controller');

// ─── Routes Clients & Destinataires (MVC Architecture) ──────────────────────
router.get('/', authAdmin, clientController.list);
router.post('/', authAdmin, clientController.create);
router.put('/:id', authAdmin, clientController.update);

module.exports = router;
