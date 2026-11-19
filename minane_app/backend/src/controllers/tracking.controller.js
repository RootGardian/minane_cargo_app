const prisma = require('../prisma');
const { VALIDATORS } = require('../middleware/sanitize');

const ALL_STATUSES = [
  'CHINA_WAREHOUSE',
  'CONTAINER_LOADED',
  'TRANSFERRED_TO_PORT',
  'IN_TRANSIT',
  'ARRIVED_DAKAR',
  'CUSTOMS_CLEARANCE',
  'READY_FOR_PICKUP',
  'DELIVERED'
];

/**
 * TrackingController — Contrôleur MVC pour le suivi public des colis
 */
const trackingController = {
  /**
   * GET /api/tracking/:code
   */
  async track(req, res) {
    try {
      const rawCode = (req.params.code || '').trim().toUpperCase();

      if (!VALIDATORS.isValidTrackingCode(rawCode)) {
        return res.status(400).json({ error: 'Format de référence colis invalide (lettres, chiffres et tirets uniquement).' });
      }

      const shipment = await prisma.shipment.findUnique({
        where: { trackingCode: rawCode },
        include: {
          client: {
            select: {
              fullName: true,
              phone: true
            }
          },
          container: {
            select: {
              containerNumber: true,
              sealNumber: true,
              transportMode: true,
              etd: true,
              eta: true,
              status: true
            }
          },
          payments: {
            select: {
              id: true,
              receiptNum: true,
              amount: true,
              method: true,
              reference: true,
              paidAt: true
            },
            orderBy: { paidAt: 'desc' }
          },
          history: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!shipment) {
        return res.status(404).json({ error: `Colis introuvable pour le code ${rawCode}.` });
      }

      const totalPaid = shipment.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = Math.max(0, shipment.totalAmount - totalPaid);

      // Masquage partiel du numéro de téléphone (Confidentialité publique)
      let maskedPhone = shipment.client.phone;
      if (maskedPhone.length > 6) {
        const start = maskedPhone.slice(0, 7);
        const end = maskedPhone.slice(-2);
        maskedPhone = `${start}***${end}`;
      }

      const currentStepIndex = ALL_STATUSES.indexOf(shipment.status);
      const isReadyOrDelivered = shipment.status === 'READY_FOR_PICKUP' || shipment.status === 'DELIVERED';
      const exposedPin = isReadyOrDelivered ? shipment.pickupPin : null;

      const waSupportMessage = `Bonjour Minane Cargo, je souhaite des informations concernant mon colis *${shipment.trackingCode}* (${shipment.description}).`;
      const waSupportUrl = `https://wa.me/221705961276?text=${encodeURIComponent(waSupportMessage)}`;

      res.json({
        shipment: {
          id: shipment.id,
          trackingCode: shipment.trackingCode,
          description: shipment.description,
          quantity: shipment.quantity,
          transportMode: shipment.transportMode,
          cbm: shipment.cbm,
          weight: shipment.weight,
          appliedRate: shipment.appliedRate,
          totalAmount: shipment.totalAmount,
          status: shipment.status,
          createdAt: shipment.createdAt,
          client: {
            fullName: shipment.client.fullName,
            maskedPhone
          },
          container: shipment.container,
          payments: shipment.payments,
          history: shipment.history,
          totalPaid,
          remainingBalance,
          pickupPin: exposedPin,
          currentStepIndex,
          allStatuses: ALL_STATUSES,
          waSupportUrl
        }
      });
    } catch (error) {
      console.error('[TrackingController.track]', error);
      res.status(500).json({ error: 'Erreur lors du suivi du colis.' });
    }
  }
};

module.exports = trackingController;

