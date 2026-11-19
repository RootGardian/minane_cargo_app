const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authAdmin } = require('../middleware/auth');
const { VALIDATORS } = require('../middleware/sanitize');

// List all containers with summary KPIs & P&L
router.get('/', authAdmin, async (req, res) => {
  try {
    const containers = await prisma.container.findMany({
      include: {
        shipments: {
          select: {
            id: true,
            totalAmount: true,
            cbm: true,
            weight: true,
            status: true
          }
        },
        expenses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const enhanced = containers.map(c => {
      const totalRevenue = c.shipments.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalExpenses = c.expenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = totalRevenue - totalExpenses;
      const marginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
      const totalCbm = c.shipments.reduce((sum, s) => sum + (s.cbm || 0), 0);
      const totalWeight = c.shipments.reduce((sum, s) => sum + (s.weight || 0), 0);

      return {
        ...c,
        shipmentCount: c.shipments.length,
        totalRevenue,
        totalExpenses,
        netProfit,
        marginPercent: parseFloat(marginPercent),
        totalCbm: parseFloat(totalCbm.toFixed(2)),
        totalWeight: parseFloat(totalWeight.toFixed(1))
      };
    });

    res.json(enhanced);
  } catch (error) {
    console.error('Error listing containers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conteneurs.' });
  }
});

// Create container
router.post('/', authAdmin, async (req, res) => {
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

    const cleanEtd = etd && !isNaN(new Date(etd).getTime()) ? new Date(etd) : null;
    const cleanEta = eta && !isNaN(new Date(eta).getTime()) ? new Date(eta) : null;

    const existing = await prisma.container.findUnique({ where: { containerNumber: cleanNum } });
    if (existing) {
      return res.status(400).json({ error: `Le conteneur ${cleanNum} existe déjà.` });
    }

    const container = await prisma.container.create({
      data: {
        containerNumber: cleanNum,
        sealNumber: cleanSeal,
        transportMode: cleanMode,
        status: cleanStatus,
        etd: cleanEtd,
        eta: cleanEta
      }
    });

    res.status(201).json({ message: 'Conteneur créé avec succès.', container });
  } catch (error) {
    console.error('Error creating container:', error);
    res.status(500).json({ error: 'Erreur lors de la création du conteneur.' });
  }
});

// Single Container Details & Full P&L
router.get('/:id', authAdmin, async (req, res) => {
  try {
    const container = await prisma.container.findUnique({
      where: { id: req.params.id },
      include: {
        shipments: {
          include: {
            client: { select: { fullName: true, phone: true } },
            payments: true
          }
        },
        expenses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!container) return res.status(404).json({ error: 'Conteneur introuvable.' });

    // P&L calculation
    const totalRevenue = container.shipments.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpenses = container.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const marginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Expenses grouped by category
    const expensesByCategory = container.expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const totalCbm = container.shipments.reduce((sum, s) => sum + (s.cbm || 0), 0);

    res.json({
      container,
      pl: {
        totalRevenue,
        totalExpenses,
        netProfit,
        marginPercent: parseFloat(marginPercent),
        expensesByCategory,
        totalCbm: parseFloat(totalCbm.toFixed(2)),
        shipmentCount: container.shipments.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// BULK UPDATE: Update Container Status -> Automatically update all shipments & add StatusHistory
router.put('/:id/status', authAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status || !VALIDATORS.isValidStatus(status)) {
      return res.status(400).json({ error: 'Statut de conteneur invalide.' });
    }

    const cleanNote = note ? note.substring(0, 500) : null;

    const container = await prisma.container.findUnique({
      where: { id: req.params.id },
      include: { shipments: true }
    });

    if (!container) return res.status(404).json({ error: 'Conteneur introuvable.' });

    // 1. Update container status
    const updatedContainer = await prisma.container.update({
      where: { id: container.id },
      data: { status }
    });

    // 2. Bulk update all attached shipments (excluding already DELIVERED shipments)
    const activeShipments = container.shipments.filter(s => s.status !== 'DELIVERED');
    const shipmentIds = activeShipments.map(s => s.id);

    if (shipmentIds.length > 0) {
      await prisma.shipment.updateMany({
        where: { id: { in: shipmentIds } },
        data: { status }
      });

      // 3. Create StatusHistory entry for each shipment
      const historyEntries = shipmentIds.map(shipmentId => ({
        shipmentId,
        status,
        note: note || `Mise à jour groupée via conteneur ${container.containerNumber} (${status})`
      }));

      await prisma.statusHistory.createMany({
        data: historyEntries
      });
    }

    res.json({
      message: `Conteneur et ${shipmentIds.length} colis mis à jour au statut ${status} avec succès.`,
      container: updatedContainer,
      updatedShipmentCount: shipmentIds.length
    });
  } catch (error) {
    console.error('Error updating container status bulk:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour groupée du conteneur.' });
  }
});

// Update Container general details
router.put('/:id', authAdmin, async (req, res) => {
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
});

// Add Expense to container
router.post('/:id/expenses', authAdmin, async (req, res) => {
  try {
    const { category, label, amount } = req.body;
    if (!category || !amount) {
      return res.status(400).json({ error: 'Catégorie et montant obligatoires.' });
    }

    const expense = await prisma.containerExpense.create({
      data: {
        containerId: req.params.id,
        category,
        label: label ? label.trim() : null,
        amount: parseInt(amount, 10)
      }
    });

    res.status(201).json({ message: 'Dépense enregistrée.', expense });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la dépense.' });
  }
});

// Delete Expense
router.delete('/:id/expenses/:expenseId', authAdmin, async (req, res) => {
  try {
    await prisma.containerExpense.delete({
      where: { id: req.params.expenseId }
    });
    res.json({ message: 'Dépense supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la dépense.' });
  }
});

module.exports = router;

