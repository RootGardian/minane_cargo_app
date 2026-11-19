const prisma = require('../prisma');

/**
 * Service métier pour la gestion des conteneurs maritimes et calculs de P&L
 */

function enrichContainer(c) {
  if (!c) return null;
  const shipments = c.shipments || [];
  const expenses = c.expenses || [];

  const totalCbm = shipments.reduce((sum, s) => sum + (s.cbm || 0), 0);
  const totalWeight = shipments.reduce((sum, s) => sum + (s.weight || 0), 0);
  const totalShipments = shipments.length;

  const totalRevenue = shipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netMargin = totalRevenue - totalExpenses;
  const profitMarginPercent = totalRevenue > 0
    ? Math.round((netMargin / totalRevenue) * 100)
    : 0;

  return {
    ...c,
    totalCbm: Number(totalCbm.toFixed(3)),
    totalWeight: Number(totalWeight.toFixed(2)),
    totalShipments,
    totalRevenue,
    totalExpenses,
    netMargin,
    profitMarginPercent
  };
}

async function listContainers() {
  const containers = await prisma.container.findMany({
    include: {
      shipments: {
        select: {
          id: true,
          trackingCode: true,
          cbm: true,
          weight: true,
          totalAmount: true,
          status: true,
          description: true
        }
      },
      expenses: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return containers.map(enrichContainer);
}

async function getContainerById(id) {
  const container = await prisma.container.findUnique({
    where: { id },
    include: {
      shipments: {
        include: {
          client: true,
          payments: true
        }
      },
      expenses: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return enrichContainer(container);
}

async function createContainer(data) {
  const { containerNumber, sealNumber, transportMode = 'MARITIME_LCL', etd, eta, status = 'CHINA_WAREHOUSE' } = data;

  const container = await prisma.container.create({
    data: {
      containerNumber: containerNumber.trim(),
      sealNumber: sealNumber ? sealNumber.trim() : null,
      transportMode,
      etd: etd ? new Date(etd) : null,
      eta: eta ? new Date(eta) : null,
      status
    }
  });

  return container;
}

async function updateContainerStatusBulk(id, { status, note }) {
  const container = await prisma.container.findUnique({
    where: { id },
    include: { shipments: true }
  });

  if (!container) throw new Error('Conteneur introuvable.');

  const shipmentIds = container.shipments.map(s => s.id);

  // Transaction atomique : met à jour le conteneur, tous les colis liés, et écrit l'historique
  await prisma.$transaction(async (tx) => {
    // 1. Mise à jour du conteneur
    await tx.container.update({
      where: { id },
      data: { status }
    });

    // 2. Mise à jour de tous les colis assignés
    if (shipmentIds.length > 0) {
      await tx.shipment.updateMany({
        where: { id: { in: shipmentIds } },
        data: { status }
      });

      // 3. Création des entrées d'historique
      const historyEntries = shipmentIds.map(sId => ({
        shipmentId: sId,
        status,
        note: note || `Mise à jour groupée via Conteneur N° ${container.containerNumber} : ${status}`
      }));

      await tx.statusHistory.createMany({
        data: historyEntries
      });
    }
  });

  return {
    message: `Statut du conteneur ${container.containerNumber} et de ses ${shipmentIds.length} colis mis à jour avec succès vers ${status}.`,
    containerId: id,
    updatedShipmentsCount: shipmentIds.length
  };
}

async function addExpense(containerId, { category, label, amount }) {
  const expense = await prisma.containerExpense.create({
    data: {
      containerId,
      category,
      label: label ? label.trim() : null,
      amount: parseInt(amount, 10)
    }
  });

  return expense;
}

async function deleteExpense(expenseId) {
  await prisma.containerExpense.delete({
    where: { id: expenseId }
  });
  return { success: true };
}

module.exports = {
  enrichContainer,
  listContainers,
  getContainerById,
  createContainer,
  updateContainerStatusBulk,
  addExpense,
  deleteExpense
};

