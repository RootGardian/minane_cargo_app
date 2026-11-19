const prisma = require('../prisma');
const { generateReceiptNumber } = require('../utils/generators');
const { VALIDATORS } = require('../middleware/sanitize');

/**
 * PaymentController — Contrôleur MVC pour la gestion de la caisse et des règlements
 */
const paymentController = {
  /**
   * POST /api/payments
   */
  async recordPayment(req, res) {
    try {
      const { shipmentId, amount, method, reference } = req.body;

      if (!shipmentId || !amount || !method) {
        return res.status(400).json({ error: 'Identifiant du colis, montant et mode de paiement requis.' });
      }

      if (!VALIDATORS.isValidPaymentMethod(method)) {
        return res.status(400).json({ error: 'Mode de paiement non autorisé (WAVE, ORANGE_MONEY, CASH ou BANK_TRANSFER).' });
      }

      const payAmount = parseInt(amount, 10);
      if (!VALIDATORS.isSafePositiveInteger(payAmount) || payAmount <= 0) {
        return res.status(400).json({ error: 'Le montant doit être un entier positif supérieur à 0 FCFA.' });
      }

      const cleanRef = reference ? reference.toString().substring(0, 100).trim() : null;

      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: { payments: true, client: true }
      });

      if (!shipment) return res.status(404).json({ error: 'Colis introuvable.' });

      const totalPaidBefore = shipment.payments.reduce((s, p) => s + p.amount, 0);
      const remainingBefore = Math.max(0, shipment.totalAmount - totalPaidBefore);

      if (payAmount > remainingBefore) {
        return res.status(400).json({
          error: `Le montant saisi (${payAmount.toLocaleString('fr-FR')} FCFA) dépasse le reste à payer (${remainingBefore.toLocaleString('fr-FR')} FCFA).`
        });
      }

      let receiptNum = generateReceiptNumber();
      let exists = await prisma.payment.findUnique({ where: { receiptNum } });
      while (exists) {
        receiptNum = generateReceiptNumber();
        exists = await prisma.payment.findUnique({ where: { receiptNum } });
      }

      const payment = await prisma.payment.create({
        data: {
          receiptNum,
          amount: payAmount,
          method,
          reference: cleanRef,
          shipmentId
        }
      });

      const newTotalPaid = totalPaidBefore + payAmount;
      const newRemaining = Math.max(0, shipment.totalAmount - newTotalPaid);

      res.status(201).json({
        message: 'Paiement enregistré avec succès.',
        payment,
        summary: {
          totalAmount: shipment.totalAmount,
          totalPaid: newTotalPaid,
          remainingBalance: newRemaining
        }
      });
    } catch (error) {
      console.error('[PaymentController.recordPayment]', error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement du paiement.' });
    }
  },

  /**
   * GET /api/payments/receivables
   */
  async getReceivables(req, res) {
    try {
      const shipments = await prisma.shipment.findMany({
        include: {
          client: true,
          container: { select: { containerNumber: true } },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const receivables = [];
      let totalGlobalDebt = 0;

      for (const s of shipments) {
        const totalPaid = s.payments.reduce((acc, p) => acc + p.amount, 0);
        const remainingBalance = s.totalAmount - totalPaid;
        if (remainingBalance > 0) {
          totalGlobalDebt += remainingBalance;
          receivables.push({
            id: s.id,
            trackingCode: s.trackingCode,
            description: s.description,
            transportMode: s.transportMode,
            status: s.status,
            totalAmount: s.totalAmount,
            totalPaid,
            remainingBalance,
            client: s.client,
            containerNumber: s.container?.containerNumber || 'Non assigné',
            createdAt: s.createdAt
          });
        }
      }

      receivables.sort((a, b) => b.remainingBalance - a.remainingBalance);

      res.json({
        totalGlobalDebt,
        count: receivables.length,
        receivables
      });
    } catch (error) {
      console.error('[PaymentController.getReceivables]', error);
      res.status(500).json({ error: 'Erreur lors du calcul des créances.' });
    }
  },

  /**
   * GET /api/payments/recent
   */
  async getRecent(req, res) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          shipment: {
            select: {
              id: true,
              trackingCode: true,
              description: true,
              totalAmount: true,
              client: { select: { fullName: true, phone: true } }
            }
          }
        },
        orderBy: { paidAt: 'desc' },
        take: 50
      });

      res.json(payments);
    } catch (error) {
      console.error('[PaymentController.getRecent]', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
};

module.exports = paymentController;

