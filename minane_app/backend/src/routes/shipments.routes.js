const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const shipmentController = require('../controllers/shipment.controller');

// ─── Routes Expéditions / Colis (MVC Architecture) ──────────────────────────
router.get('/', authAdmin, shipmentController.list);
router.get('/:id', authAdmin, shipmentController.getById);
router.post('/', authAdmin, shipmentController.create);
router.put('/:id', authAdmin, shipmentController.update);
router.put('/:id/status', authAdmin, shipmentController.updateStatus);
router.post('/:id/deliver', authAdmin, shipmentController.deliver);

module.exports = router;
