const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { authAdmin } = require('../middleware/auth');
const { VALIDATORS } = require('../middleware/sanitize');

// List clients with summary
router.get('/', authAdmin, async (req, res) => {
  try {
    const { search, wholesalerOnly } = req.query;

    const where = {};
    if (wholesalerOnly === 'true') where.isWholesaler = true;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        shipments: {
          select: {
            id: true,
            totalAmount: true,
            payments: { select: { amount: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enhanced = clients.map(c => {
      let totalDebt = 0;
      let totalBilled = 0;

      for (const s of c.shipments) {
        totalBilled += s.totalAmount;
        const paid = s.payments.reduce((sum, p) => sum + p.amount, 0);
        totalDebt += Math.max(0, s.totalAmount - paid);
      }

      return {
        id: c.id,
        fullName: c.fullName,
        phone: c.phone,
        isWholesaler: c.isWholesaler,
        hasPin: !!c.pinHash,
        address: c.address,
        createdAt: c.createdAt,
        shipmentCount: c.shipments.length,
        totalBilled,
        totalDebt
      };
    });

    res.json(enhanced);
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des clients.' });
  }
});

// Create client
router.post('/', authAdmin, async (req, res) => {
  try {
    const { fullName, phone, pin, isWholesaler, address } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Nom complet et numéro de téléphone requis.' });
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return res.status(400).json({ error: 'Le nom du client doit contenir entre 2 et 100 caractères.' });
    }

    let cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!VALIDATORS.isValidPhone(cleanPhone)) {
      return res.status(400).json({ error: 'Format de numéro de téléphone invalide.' });
    }

    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('221')) cleanPhone = '+' + cleanPhone;
      else if (cleanPhone.length === 9) cleanPhone = '+221' + cleanPhone;
    }

    const existing = await prisma.client.findFirst({
      where: { phone: { in: [cleanPhone, phone.trim()] } }
    });

    if (existing) {
      return res.status(400).json({ error: 'Ce numéro de téléphone est déjà enregistré.' });
    }

    let pinHash = null;
    if (pin) {
      if (!VALIDATORS.isValidPin(pin)) {
        return res.status(400).json({ error: 'Le code PIN doit contenir exactement 4 chiffres.' });
      }
      const salt = await bcrypt.genSalt(10);
      pinHash = await bcrypt.hash(pin.toString().trim(), salt);
    }

    const cleanAddress = address ? address.toString().substring(0, 200).trim() : null;

    const client = await prisma.client.create({
      data: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        pinHash,
        isWholesaler: !!isWholesaler,
        address: cleanAddress
      }
    });

    res.status(201).json({ message: 'Client créé avec succès.', client });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Erreur lors de la création du client.' });
  }
});

// Update client (PIN or details)
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const { fullName, phone, pin, isWholesaler, address } = req.body;

    const data = {};
    if (fullName) data.fullName = fullName.trim();
    if (phone) {
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('221')) cleanPhone = '+' + cleanPhone;
        else if (cleanPhone.length === 9) cleanPhone = '+221' + cleanPhone;
      }
      data.phone = cleanPhone;
    }
    if (isWholesaler !== undefined) data.isWholesaler = !!isWholesaler;
    if (address !== undefined) data.address = address ? address.trim() : null;

    if (pin) {
      const salt = await bcrypt.genSalt(10);
      data.pinHash = await bcrypt.hash(pin.toString().trim(), salt);
    }

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data
    });

    res.json({ message: 'Client mis à jour.', client: updated });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

module.exports = router;

