const prisma = require('../prisma');
const { generateTrackingCode, generatePickupPin, generateWhatsAppShareUrl } = require('../utils/generators');
const { VALIDATORS } = require('../middleware/sanitize');

/**
 * Service métier pour la gestion des colis (Shipments)
 * Centralise les règles de calcul, d'enrichissement et d'accès aux données.
 */

/**
 * Calcule les soldes financiers et l'URL de partage WhatsApp pour un colis
 */
function enrichShipment(shipment) {
  if (!shipment) return null;
  const payments = shipment.payments || [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(0, shipment.totalAmount - totalPaid);
  
  const clientPhone = shipment.client?.phone || '';
  const waShareUrl = generateWhatsAppShareUrl(
    clientPhone,
    shipment.trackingCode,
    shipment.pickupPin,
    shipment.description,
    remainingBalance,
    shipment.transportMode
  );

  return {
    ...shipment,
    totalPaid,
    remainingBalance,
    waShareUrl
  };
}

/**
 * Liste les colis avec filtres optionnels
 */
async function listShipments({ search, status, containerId, clientId } = {}) {
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

  return shipments.map(enrichShipment);
}

/**
 * Récupère un colis par son ID avec tout son historique et ses paiements
 */
async function getShipmentById(id) {
  const shipment = await prisma.shipment.findUnique({
    where: { id },
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

  return enrichShipment(shipment);
}

/**
 * Crée un nouveau colis à Guangzhou avec attribution du code MNC et du PIN secret
 */
async function createShipment(data) {
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
  } = data;

  // 1. Résolution ou création du client destinataire
  let resolvedClientId = clientId;
  if (!resolvedClientId) {
    if (!newClientName || !newClientPhone) {
      throw new Error('Nom et téléphone du client requis pour un nouveau client.');
    }

    if (newClientName.trim().length < 2 || newClientName.trim().length > 100) {
      throw new Error('Le nom du client doit contenir entre 2 et 100 caractères.');
    }

    let cleanPhone = newClientPhone.trim().replace(/[\s\-\(\)]/g, '');
    if (!VALIDATORS.isValidPhone(cleanPhone)) {
      throw new Error('Format de numéro de téléphone invalide.');
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

  // 2. Récupération des taux actifs
  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  const defaultRate = settings?.maritimeCbmRate || 165000;

  const appliedRate = overrideRate !== undefined && overrideRate !== null && overrideRate !== ''
    ? parseInt(overrideRate, 10)
    : defaultRate;

  // 3. Calcul du montant total ou dérogation VIP
  let calculatedAmount = 0;
  if (overrideTotalAmount !== undefined && overrideTotalAmount !== null && overrideTotalAmount !== '') {
    calculatedAmount = parseInt(overrideTotalAmount, 10);
  } else {
    const safeCbm = parseFloat(cbm) || 0;
    calculatedAmount = Math.round(safeCbm * appliedRate);
  }

  // 4. Génération code de suivi unique MNC-XXXX[A-Z] & PIN à 4 chiffres
  let trackingCode = generateTrackingCode();
  let codeExists = await prisma.shipment.findUnique({ where: { trackingCode } });
  while (codeExists) {
    trackingCode = generateTrackingCode();
    codeExists = await prisma.shipment.findUnique({ where: { trackingCode } });
  }

  const pickupPin = generatePickupPin();

  // 5. Enregistrement transactionnel du colis et de l'historique
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
      clientId: resolvedClientId,
      containerId: containerId || null,
      status: 'CHINA_WAREHOUSE',
      history: {
        create: {
          status: 'CHINA_WAREHOUSE',
          note: initialNote || 'Colis réceptionné et enregistré à l\'entrepôt de Guangzhou'
        }
      }
    },
    include: {
      client: true,
      container: true,
      payments: true
    }
  });

  return enrichShipment(shipment);
}

/**
 * Met à jour le statut d'un colis et trace l'historique
 */
async function updateShipmentStatus(id, { status, note }) {
  const current = await prisma.shipment.findUnique({
    where: { id },
    include: { client: true, payments: true }
  });

  if (!current) throw new Error('Colis introuvable.');

  const updated = await prisma.$transaction([
    prisma.shipment.update({
      where: { id },
      data: { status }
    }),
    prisma.statusHistory.create({
      data: {
        shipmentId: id,
        status,
        note: note || `Statut mis à jour : ${status}`
      }
    })
  ]);

  const refreshed = await getShipmentById(id);
  return refreshed;
}

/**
 * Valide le retrait sécurisé d'un colis au guichet de Dakar
 */
async function deliverShipmentSecure(id, { pickupPin, allowDebtBypass = false, deliveryNote = '' }) {
  const shipment = await getShipmentById(id);
  if (!shipment) throw new Error('Colis introuvable.');

  if (shipment.status === 'DELIVERED') {
    throw new Error('Ce colis a déjà été retiré et marqué comme livré.');
  }

  // Vérification stricte du code PIN confidentiel
  if (String(shipment.pickupPin).trim() !== String(pickupPin).trim()) {
    throw new Error('CODE PIN DE RETRAIT INCORRECT. Vérification d\'identité requise au guichet.');
  }

  // Vérification de la solvabilité
  if (shipment.remainingBalance > 0 && !allowDebtBypass) {
    throw new Error(`Solde impayé de ${shipment.remainingBalance} FCFA. Encaissement requis avant remise.`);
  }

  await prisma.$transaction([
    prisma.shipment.update({
      where: { id },
      data: { status: 'DELIVERED' }
    }),
    prisma.statusHistory.create({
      data: {
        shipmentId: id,
        status: 'DELIVERED',
        note: deliveryNote || `Colis remis en main propre au guichet de Dakar (PIN vérifié)`
      }
    })
  ]);

  return getShipmentById(id);
}

module.exports = {
  enrichShipment,
  listShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  deliverShipmentSecure
};

