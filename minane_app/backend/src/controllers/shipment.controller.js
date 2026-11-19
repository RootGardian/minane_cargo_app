const prisma = require('../prisma');
const shipmentService = require('../services/shipment.service');
const { VALIDATORS } = require('../middleware/sanitize');

/**
 * ShipmentController — Contrôleur MVC pour la gestion des expéditions
 */
const shipmentController = {
  /**
   * GET /api/shipments
   */
  async list(req, res) {
    try {
      const shipments = await shipmentService.listShipments(req.query);
      res.json(shipments);
    } catch (error) {
      console.error('[ShipmentController.list]', error);
      res.status(500).json({ error: 'Erreur lors du chargement des colis.' });
    }
  },

  /**
   * GET /api/shipments/:id
   */
  async getById(req, res) {
    try {
      const shipment = await shipmentService.getShipmentById(req.params.id);
      if (!shipment) return res.status(404).json({ error: 'Colis introuvable.' });
      res.json(shipment);
    } catch (error) {
      console.error('[ShipmentController.getById]', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  /**
   * POST /api/shipments
   */
  async create(req, res) {
    try {
      const { description, quantity, transportMode, cbm, weight } = req.body;

      if (!description || description.trim().length < 2) {
        return res.status(400).json({ error: 'La description du colis est requise (min 2 caractères).' });
      }
      if (description.length > 500) {
        return res.status(400).json({ error: 'La description ne doit pas dépasser 500 caractères.' });
      }

      const cleanMode = (transportMode || 'MARITIME_LCL').toUpperCase();
      if (!VALIDATORS.isValidTransportMode(cleanMode)) {
        return res.status(400).json({ error: 'Mode de transport invalide (MARITIME_LCL ou MARITIME_FCL).' });
      }

      const safeQty = parseInt(quantity, 10);
      if (isNaN(safeQty) || safeQty < 1 || safeQty > 10000) {
        return res.status(400).json({ error: 'Le nombre de colis doit être compris entre 1 et 10 000.' });
      }

      if (cbm !== undefined && cbm !== null && cbm !== '' && !VALIDATORS.isSafePositiveNumber(cbm, 5000)) {
        return res.status(400).json({ error: 'Le volume en CBM doit être un nombre positif valide.' });
      }

      if (weight !== undefined && weight !== null && weight !== '' && !VALIDATORS.isSafePositiveNumber(weight, 100000)) {
        return res.status(400).json({ error: 'Le poids en Kg doit être un nombre positif valide.' });
      }

      const shipment = await shipmentService.createShipment(req.body);
      res.status(201).json({
        message: 'Colis enregistré avec succès à l\'entrepôt de Guangzhou.',
        shipment
      });
    } catch (error) {
      console.error('[ShipmentController.create]', error.message);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * PUT /api/shipments/:id
   */
  async update(req, res) {
    try {
      const {
        description,
        quantity,
        transportMode,
        cbm,
        weight,
        appliedRate,
        totalAmount,
        containerId
      } = req.body;

      const updated = await prisma.shipment.update({
        where: { id: req.params.id },
        data: {
          ...(description && { description: description.trim() }),
          ...(quantity !== undefined && { quantity: parseInt(quantity, 10) }),
          ...(transportMode && { transportMode }),
          ...(cbm !== undefined && { cbm: cbm !== '' ? parseFloat(cbm) : null }),
          ...(weight !== undefined && { weight: weight !== '' ? parseFloat(weight) : null }),
          ...(appliedRate !== undefined && { appliedRate: parseInt(appliedRate, 10) }),
          ...(totalAmount !== undefined && { totalAmount: parseInt(totalAmount, 10) }),
          ...(containerId !== undefined && { containerId: containerId || null })
        },
        include: {
          client: true,
          container: true,
          payments: true
        }
      });

      res.json({ message: 'Colis mis à jour avec succès.', shipment: updated });
    } catch (error) {
      console.error('[ShipmentController.update]', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du colis.' });
    }
  },

  /**
   * PUT /api/shipments/:id/status
   */
  async updateStatus(req, res) {
    try {
      const { status, note } = req.body;
      if (!status || !VALIDATORS.isValidStatus(status)) {
        return res.status(400).json({ error: 'Statut de livraison invalide.' });
      }

      if (status === 'DELIVERED') {
        return res.status(400).json({
          error: 'Pour valider la livraison (DELIVERED), veuillez utiliser le module de validation de retrait sécurisé avec le code PIN.'
        });
      }

      const updated = await shipmentService.updateShipmentStatus(req.params.id, { status, note });
      res.json({ message: 'Statut mis à jour avec succès.', shipment: updated });
    } catch (error) {
      console.error('[ShipmentController.updateStatus]', error.message);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * POST /api/shipments/:id/deliver
   */
  async deliver(req, res) {
    try {
      const { pickupPin, allowDebtBypass, deliveryNote } = req.body;

      if (!pickupPin || !VALIDATORS.isValidPin(pickupPin)) {
        return res.status(400).json({
          error: 'Format du code PIN invalide. Le PIN doit être composé de 4 chiffres.'
        });
      }

      const updated = await shipmentService.deliverShipmentSecure(req.params.id, {
        pickupPin,
        allowDebtBypass,
        deliveryNote
      });

      res.json({
        message: 'Colis retiré et marqué comme livré avec succès !',
        shipment: updated
      });
    } catch (error) {
      console.error('[ShipmentController.deliver]', error.message);
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = shipmentController;

