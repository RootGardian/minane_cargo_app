const prisma = require('../prisma');
const containerService = require('../services/container.service');
const { VALIDATORS } = require('../middleware/sanitize');

/**
 * ContainerController — Contrôleur MVC pour la gestion des conteneurs maritimes
 */
const containerController = {
  /**
   * GET /api/containers
   */
  async list(req, res) {
    try {
      const containers = await containerService.listContainers();
      res.json(containers);
    } catch (error) {
      console.error('[ContainerController.list]', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des conteneurs.' });
    }
  },

  /**
   * POST /api/containers
   */
  async create(req, res) {
    try {
      const { containerNumber, sealNumber, transportMode, etd, eta, status } = req.body;
      if (!containerNumber) {
        return res.status(400).json({ error: 'Le numéro de conteneur est obligatoire.' });
      }

      const cleanNum = containerNumber.trim().toUpperCase();
      if (!/^[A-Z0-9\-]{3,30}$/.test(cleanNum)) {
        return res.status(400).json({ error: 'Numéro de conteneur invalide (caractères alphanumériques et tirets uniquement).' });
      }

      const cleanSeal = sealNumber ? sealNumber.toString().substring(0, 50).trim() : null;
      const cleanMode = (transportMode || 'MARITIME_LCL').toUpperCase();
      if (!VALIDATORS.isValidTransportMode(cleanMode)) {
        return res.status(400).json({ error: 'Mode de transport conteneur invalide.' });
      }

      const cleanStatus = status || 'CHINA_WAREHOUSE';
      if (!VALIDATORS.isValidStatus(cleanStatus)) {
        return res.status(400).json({ error: 'Statut initial de conteneur invalide.' });
      }

      const existing = await prisma.container.findUnique({ where: { containerNumber: cleanNum } });
      if (existing) {
        return res.status(400).json({ error: `Le conteneur ${cleanNum} existe déjà.` });
      }

      const container = await containerService.createContainer({
        containerNumber: cleanNum,
        sealNumber: cleanSeal,
        transportMode: cleanMode,
        status: cleanStatus,
        etd,
        eta
      });

      res.status(201).json({ message: 'Conteneur créé avec succès.', container });
    } catch (error) {
      console.error('[ContainerController.create]', error);
      res.status(500).json({ error: 'Erreur lors de la création du conteneur.' });
    }
  },

  /**
   * GET /api/containers/:id
   */
  async getById(req, res) {
    try {
      const container = await containerService.getContainerById(req.params.id);
      if (!container) return res.status(404).json({ error: 'Conteneur introuvable.' });

      const expensesByCategory = (container.expenses || []).reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

      res.json({
        container,
        pl: {
          totalRevenue: container.totalRevenue,
          totalExpenses: container.totalExpenses,
          netProfit: container.netMargin,
          marginPercent: container.profitMarginPercent,
          expensesByCategory,
          totalCbm: container.totalCbm,
          shipmentCount: container.totalShipments
        }
      });
    } catch (error) {
      console.error('[ContainerController.getById]', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  /**
   * PUT /api/containers/:id/status
   */
  async updateStatusBulk(req, res) {
    try {
      const { status, note } = req.body;
      if (!status || !VALIDATORS.isValidStatus(status)) {
        return res.status(400).json({ error: 'Statut de conteneur invalide.' });
      }

      const result = await containerService.updateContainerStatusBulk(req.params.id, { status, note });
      res.json(result);
    } catch (error) {
      console.error('[ContainerController.updateStatusBulk]', error.message);
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * PUT /api/containers/:id
   */
  async update(req, res) {
    try {
      const { containerNumber, sealNumber, transportMode, etd, eta } = req.body;

      const updated = await prisma.container.update({
        where: { id: req.params.id },
        data: {
          ...(containerNumber && { containerNumber: containerNumber.trim().toUpperCase() }),
          ...(sealNumber !== undefined && { sealNumber: sealNumber ? sealNumber.trim() : null }),
          ...(transportMode && { transportMode }),
          ...(etd !== undefined && { etd: etd ? new Date(etd) : null }),
          ...(eta !== undefined && { eta: eta ? new Date(eta) : null })
        }
      });

      res.json({ message: 'Conteneur mis à jour avec succès.', container: updated });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la modification du conteneur.' });
    }
  },

  /**
   * POST /api/containers/:id/expenses
   */
  async addExpense(req, res) {
    try {
      const { category, label, amount } = req.body;
      if (!category || !amount) {
        return res.status(400).json({ error: 'Catégorie et montant obligatoires.' });
      }

      const expense = await containerService.addExpense(req.params.id, { category, label, amount });
      res.status(201).json({ message: 'Dépense enregistrée.', expense });
    } catch (error) {
      console.error('[ContainerController.addExpense]', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout de la dépense.' });
    }
  },

  /**
   * DELETE /api/containers/:id/expenses/:expenseId
   */
  async deleteExpense(req, res) {
    try {
      await containerService.deleteExpense(req.params.expenseId);
      res.json({ message: 'Dépense supprimée avec succès.' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de la dépense.' });
    }
  }
};

module.exports = containerController;

