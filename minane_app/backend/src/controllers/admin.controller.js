const prisma = require('../prisma');

/**
 * AdminController — Actions administratives dangereuses (Reset BDD, etc.)
 * Chaque action nécessite le token JWT administrateur.
 */
const adminController = {

  /**
   * DELETE /api/admin/reset-data
   * Vide toutes les données opérationnelles :
   * Shipments, StatusHistory, Payments, Containers, ContainerExpenses, Clients
   * Conserve : Admin, AppSettings
   */
  async resetData(req, res) {
    const { confirmPhrase } = req.body;

    // Double confirmation obligatoire pour éviter tout effacement accidentel
    if (confirmPhrase !== 'VIDER LA BASE') {
      return res.status(400).json({
        error: 'Phrase de confirmation incorrecte. Tapez exactement : VIDER LA BASE'
      });
    }

    try {
      // Suppression en cascade dans le bon ordre (contraintes FK)
      await prisma.$transaction([
        prisma.payment.deleteMany(),
        prisma.statusHistory.deleteMany(),
        prisma.shipment.deleteMany(),
        prisma.containerExpense.deleteMany(),
        prisma.container.deleteMany(),
        prisma.client.deleteMany(),
      ]);

      console.log('[AdminController.resetData] ✅ Base de données vidée par un administrateur.');

      res.json({
        message: 'Base de données opérationnelle vidée avec succès. Colis, conteneurs, règlements et clients supprimés. Paramètres et compte administrateur conservés.',
        deletedCollections: ['payments', 'statusHistory', 'shipments', 'containerExpenses', 'containers', 'clients']
      });
    } catch (error) {
      console.error('[AdminController.resetData]', error);
      res.status(500).json({ error: 'Erreur lors de la réinitialisation de la base de données.' });
    }
  }
};

module.exports = adminController;

