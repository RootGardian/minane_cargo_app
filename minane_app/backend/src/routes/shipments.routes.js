const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authAdmin } = require('../middleware/auth');
const { generateTrackingCode, generatePickupPin, generateWhatsAppShareUrl } = require('../utils/generators');
const { VALIDATORS } = require('../middleware/sanitize');

// List shipments with filters
router.get('/', authAdmin, async (req, res) => {
  try {
    const { search, status, containerId, clientId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (containerId) where.containerId = containerId;
    if (clientId) where.clientId = clientId;

    if (search) {
      where.OR = [
        { trackingCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { client: { phone: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        client: true,
        container: {
          select: {
            id: true,
            containerNumber: true,
            status: true
          }
        },
        payments: true,
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enhanced = shipments.map(s => {
      const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = Math.max(0, s.totalAmount - totalPaid);
      const waShareUrl = generateWhatsAppShareUrl(
        s.client.phone,
        s.trackingCode,
        s.pickupPin,
        s.description,
        remainingBalance,
        s.transportMode
      );

      return {
        ...s,
        totalPaid,
        remainingBalance,
        waShareUrl
      };
    });

    res.json(enhanced);
  } catch (error) {
    console.error('Error listing shipments:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des colis.' });
  }
});

// Get Single Shipment Details
router.get('/:id', authAdmin, async (req, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        container: true,
        payments: {
          orderBy: { paidAt: 'desc' }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!shipment) return res.status(404).json({ error: 'Colis introuvable.' });

    const totalPaid = shipment.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = Math.max(0, shipment.totalAmount - totalPaid);
    const waShareUrl = generateWhatsAppShareUrl(
      shipment.client.phone,
      shipment.trackingCode,
      shipment.pickupPin,
      shipment.description,
      remainingBalance,
      shipment.transportMode
    );

    res.json({
      ...shipment,
      totalPaid,
      remainingBalance,
      waShareUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Create Shipment
router.post('/', authAdmin, async (req, res) => {
  try {
    const {
      clientId,
      newClientName,
      newClientPhone,
      isWholesaler,
      description,
      quantity = 1,
      transportMode = 'MARITIME_LCL',
      cbm,
      weight,
      containerId,
      overrideRate,
      overrideTotalAmount,
      initialNote
    } = req.body;

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

    // 1. Resolve or create client
    let resolvedClientId = clientId;
    if (!resolvedClientId) {
      if (!newClientName || !newClientPhone) {
        return res.status(400).json({ error: 'Nom et téléphone du client requis pour un nouveau client.' });
      }

      if (newClientName.trim().length < 2 || newClientName.trim().length > 100) {
        return res.status(400).json({ error: 'Le nom du client doit contenir entre 2 et 100 caractères.' });
      }

      let cleanPhone = newClientPhone.trim().replace(/[\s\-\(\)]/g, '');
      if (!VALIDATORS.isValidPhone(cleanPhone)) {
        return res.status(400).json({ error: 'Format de numéro de téléphone invalide.' });
      }
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('221')) cleanPhone = '+' + cleanPhone;
        else if (cleanPhone.length === 9) cleanPhone = '+221' + cleanPhone;
      }

      let existingClient = await prisma.client.findFirst({
        where: { phone: { in: [cleanPhone, newClientPhone.trim()] } }
      });

      if (existingClient) {
        resolvedClientId = existingClient.id;
      } else {
        const newClient = await prisma.client.create({
          data: {
            fullName: newClientName.trim(),
            phone: cleanPhone,
            isWholesaler: !!isWholesaler
          }
        });
        resolvedClientId = newClient.id;
      }
    }

    // 2. Fetch active settings for rate calculation
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
    const defaultRates = {
      MARITIME_LCL: settings?.maritimeCbmRate || 165000,
      MARITIME_FCL: settings?.maritimeCbmRate || 165000
    };

    const appliedRate = overrideRate !== undefined && overrideRate !== null && overrideRate !== ''
      ? parseInt(overrideRate, 10)
      : (defaultRates[transportMode] || defaultRates.MARITIME_LCL);

    // 3. Compute totalAmount or use VIP Override
    let calculatedAmount = 0;
    if (overrideTotalAmount !== undefined && overrideTotalAmount !== null && overrideTotalAmount !== '') {
      // VIP override
      calculatedAmount = parseInt(overrideTotalAmount, 10);
    } else {
      const safeCbm = parseFloat(cbm) || 0;
      calculatedAmount = Math.round(safeCbm * appliedRate);
    }

    // 4. Generate unique tracking code & 4-digit pickup PIN
    let trackingCode = generateTrackingCode();
    let codeExists = await prisma.shipment.findUnique({ where: { trackingCode } });
    while (codeExists) {
      trackingCode = generateTrackingCode();
      codeExists = await prisma.shipment.findUnique({ where: { trackingCode } });
    }

    const pickupPin = generatePickupPin();

    // 5. Create Shipment & initial status history
    const shipment = await prisma.shipment.create({
      data: {
        trackingCode,
        pickupPin,
        description: description.trim(),
        quantity: parseInt(quantity, 10) || 1,
        transportMode,
        cbm: cbm !== undefined && cbm !== '' ? parseFloat(cbm) : null,
        weight: weight !== undefined && weight !== '' ? parseFloat(weight) : null,
        appliedRate,
        totalAmount: calculatedAmount,
        status: 'CHINA_WAREHOUSE',
        clientId: resolvedClientId,
        containerId: containerId || null,
        history: {
          create: {
            status: 'CHINA_WAREHOUSE',
            note: initialNote || 'Colis réceptionné à l\'entrepôt en Chine (Guangzhou)'
          }
        }
      },
      include: {
        client: true,
        container: true,
        payments: true
      }
    });

    const waShareUrl = generateWhatsAppShareUrl(
      shipment.client.phone,
      shipment.trackingCode,
      shipment.pickupPin,
      shipment.description,
      shipment.totalAmount,
      shipment.transportMode
    );

    res.status(201).json({
      message: 'Colis créé avec succès.',
      shipment: {
        ...shipment,
        totalPaid: 0,
        remainingBalance: shipment.totalAmount,
        waShareUrl
      }
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Erreur lors de la création du colis.' });
  }
});

// Update Shipment info / VIP override
router.put('/:id', authAdmin, async (req, res) => {
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
    console.error('Error updating shipment:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du colis.' });
  }
});

// Update Status (individual shipment)
router.put('/:id/status', authAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status || !VALIDATORS.isValidStatus(status)) {
      return res.status(400).json({ error: 'Statut de livraison invalide.' });
    }

    // Prevent direct status change to DELIVERED via this route without PIN verification
    if (status === 'DELIVERED') {
      return res.status(400).json({
        error: 'Pour valider la livraison (DELIVERED), veuillez utiliser le module de validation de retrait sécurisé avec le code PIN.'
      });
    }

    const cleanNote = note ? note.substring(0, 500) : `Statut mis à jour vers ${status}`;

    const updated = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        status,
        history: {
          create: {
            status,
            note: note || `Statut mis à jour vers ${status}`
          }
        }
      },
      include: {
        client: true,
        history: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({ message: 'Statut mis à jour avec succès.', shipment: updated });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Erreur lors du changement de statut.' });
  }
});

// CRITICAL SECURE PICKUP VALIDATION (DELIVERED)
router.post('/:id/deliver', authAdmin, async (req, res) => {
  try {
    const { pickupPin, allowDebtBypass = false, deliveryNote } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        payments: true,
        client: true
      }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Colis introuvable.' });
    }

    if (shipment.status === 'DELIVERED') {
      return res.status(400).json({ error: 'Ce colis a déjà été retiré et livré.' });
    }

    // 1. PIN verification
    if (!pickupPin || !VALIDATORS.isValidPin(pickupPin)) {
      return res.status(400).json({
        error: 'Format du code PIN invalide. Le PIN doit être composé de 4 chiffres.'
      });
    }

    if (pickupPin.toString().trim() !== shipment.pickupPin.toString().trim()) {
      return res.status(400).json({
        error: 'Code PIN de retrait incorrect. Retrait refusé pour des raisons de sécurité.'
      });
    }

    // 2. Financial verification (Reste à payer)
    const totalPaid = shipment.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = Math.max(0, shipment.totalAmount - totalPaid);

    if (remainingBalance > 0 && !allowDebtBypass) {
      return res.status(400).json({
        error: `Impossible de valider le retrait : le colis présente un solde impayé de ${remainingBalance.toLocaleString('fr-FR')} FCFA. Veuillez encaisser le montant ou cocher la dérogation admin avec motif.`,
        remainingBalance
      });
    }

    // 3. Mark as DELIVERED & log status history
    const finalNote = remainingBalance > 0
      ? `Retrait validé avec dérogation admin (Créance restante: ${remainingBalance.toLocaleString('fr-FR')} FCFA). ${deliveryNote || ''}`.trim()
      : `Retrait sécurisé validé par PIN client (${shipment.pickupPin}) et solde soldé. ${deliveryNote || ''}`.trim();

    const updated = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        status: 'DELIVERED',
        history: {
          create: {
            status: 'DELIVERED',
            note: finalNote
          }
        }
      },
      include: {
        client: true,
        payments: true,
        history: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json({
      message: 'Colis retiré et marqué comme livré avec succès !',
      shipment: updated
    });
  } catch (error) {
    console.error('Error during pickup delivery:', error);
    res.status(500).json({ error: 'Erreur lors de la validation de retrait.' });
  }
});

module.exports = router;

