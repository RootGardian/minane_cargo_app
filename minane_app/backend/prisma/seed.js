const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Minane Cargo Database Seeding ---');

  // 1. AppSettings
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      maritimeCbmRate: 165000,
      airNormalKgRate: 8500,
      airExpressKgRate: 11000,
      nextCutoffDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      nextLoadingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
      nextEstimatedArrival: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // In 35 days
      announcementBanner: '🚢 Ligne maritime directe Guangzhou &  ➔ Port de Dakar Môle 2 • Réception continue de colis en entrepôts.'
    }
  });

  // 2. Admin account from Environment variables
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@minanecargo.sn').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminMinane2026!';
  const adminName = process.env.ADMIN_NAME || 'Directeur des Opérations Dakar';

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminPasswordHash
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash
    }
  });
  console.log('Admin user seeded from environment:', admin.email);

  // 3. Clients (Grossistes et Particulier)
  const pinWholesaler1 = await bcrypt.hash('1234', salt);
  const client1 = await prisma.client.upsert({
    where: { phone: '+221771234567' },
    update: { pinHash: pinWholesaler1 },
    create: {
      fullName: 'Moussa Diop (Sandaga Import)',
      phone: '+221771234567',
      pinHash: pinWholesaler1,
      isWholesaler: true,
      address: 'Marché Sandaga, Allées  Dakar, Dakar'
    }
  });

  const pinWholesaler2 = await bcrypt.hash('5678', salt);
  const client2 = await prisma.client.upsert({
    where: { phone: '+221782345678' },
    update: { pinHash: pinWholesaler2 },
    create: {
      fullName: 'Fatou Ndiaye (HighTech  Dakar)',
      phone: '+221782345678',
      pinHash: pinWholesaler2,
      isWholesaler: true,
      address: 'Centre Commercial  Dakar, Dakar'
    }
  });

  const client3 = await prisma.client.upsert({
    where: { phone: '+221763456789' },
    update: {},
    create: {
      fullName: 'Ibrahima Fall',
      phone: '+221763456789',
      isWholesaler: false,
      address: 'Liberté 6 Extension, Dakar'
    }
  });

  // 4. Containers
  const container1 = await prisma.container.upsert({
    where: { containerNumber: 'CMAU-419082-7' },
    update: {},
    create: {
      containerNumber: 'CMAU-419082-7',
      sealNumber: 'SL-119283',
      transportMode: 'MARITIME_LCL',
      status: 'READY_FOR_PICKUP',
      etd: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      eta: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  const container2 = await prisma.container.upsert({
    where: { containerNumber: 'MSKU-982341-2' },
    update: {},
    create: {
      containerNumber: 'MSKU-982341-2',
      sealNumber: 'SL-883921',
      transportMode: 'MARITIME_LCL',
      status: 'IN_TRANSIT',
      etd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      eta: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  });

  // Container Expenses for CMAU-419082-7
  await prisma.containerExpense.deleteMany({ where: { containerId: container1.id } });
  await prisma.containerExpense.createMany({
    data: [
      { containerId: container1.id, category: 'SEA_FREIGHT', label: 'Fret Maritime Chine-Dakar', amount: 2600000 },
      { containerId: container1.id, category: 'PORT_FEES', label: 'Frais Port de Dakar (PAD)', amount: 520000 },
      { containerId: container1.id, category: 'CUSTOMS', label: 'Dédouanement Groupage', amount: 1350000 },
      { containerId: container1.id, category: 'HANDLING', label: 'Manutention et Dépotage', amount: 300000 },
      { containerId: container1.id, category: 'LOCAL_TRANSPORT', label: 'Transport Camion vers Dépôt  Dakar', amount: 180000 }
    ]
  });

  // 5. Shipments
  // Shipment 1: MNC-8492A (Ready for pickup, partial payment)
  const shipment1 = await prisma.shipment.upsert({
    where: { trackingCode: 'MNC-8492A' },
    update: {},
    create: {
      trackingCode: 'MNC-8492A',
      pickupPin: '4821',
      description: '3 Cartons Chaussures & Maroquinerie Guangzhou',
      quantity: 3,
      transportMode: 'MARITIME_LCL',
      cbm: 1.25,
      weight: 140,
      appliedRate: 165000,
      totalAmount: 206250,
      status: 'READY_FOR_PICKUP',
      clientId: client1.id,
      containerId: container1.id
    }
  });

  await prisma.payment.deleteMany({ where: { shipmentId: shipment1.id } });
  await prisma.payment.create({
    data: {
      receiptNum: 'REC-2026-001',
      amount: 100000,
      method: 'WAVE',
      reference: 'WV-99201481',
      shipmentId: shipment1.id
    }
  });

  await prisma.statusHistory.deleteMany({ where: { shipmentId: shipment1.id } });
  await prisma.statusHistory.createMany({
    data: [
      { shipmentId: shipment1.id, status: 'CHINA_WAREHOUSE', note: 'Réceptionné à Guangzhou entrepôt 3B' },
      { shipmentId: shipment1.id, status: 'CONTAINER_LOADED', note: 'Empoté dans le conteneur CMAU-419082-7' },
      { shipmentId: shipment1.id, status: 'TRANSFERRED_TO_PORT', note: 'Transféré au port de Nansha' },
      { shipmentId: shipment1.id, status: 'IN_TRANSIT', note: 'Navire en mer vers Dakar' },
      { shipmentId: shipment1.id, status: 'ARRIVED_DAKAR', note: 'Navire accosté au Môle 2 - Port de Dakar' },
      { shipmentId: shipment1.id, status: 'CUSTOMS_CLEARANCE', note: 'Formalités douanières en cours' },
      { shipmentId: shipment1.id, status: 'READY_FOR_PICKUP', note: 'Disponible au dépôt de  Dakar avec PIN de retrait' }
    ]
  });

  // Shipment 2: MNC-1049B (Ready for pickup, 100% paid)
  const shipment2 = await prisma.shipment.upsert({
    where: { trackingCode: 'MNC-1049B' },
    update: {},
    create: {
      trackingCode: 'MNC-1049B',
      pickupPin: '9312',
      description: '5 Cartons Accessoires Téléphones & Coques Yiwu',
      quantity: 5,
      transportMode: 'MARITIME_LCL',
      cbm: 0.8,
      weight: 95,
      appliedRate: 165000,
      totalAmount: 132000,
      status: 'READY_FOR_PICKUP',
      clientId: client2.id,
      containerId: container1.id
    }
  });

  await prisma.payment.deleteMany({ where: { shipmentId: shipment2.id } });
  await prisma.payment.create({
    data: {
      receiptNum: 'REC-2026-002',
      amount: 132000,
      method: 'ORANGE_MONEY',
      reference: 'OM-44910281',
      shipmentId: shipment2.id
    }
  });

  // Shipment 3: MNC-7723C (In transit, VIP override rate)
  const shipment3 = await prisma.shipment.upsert({
    where: { trackingCode: 'MNC-7723C' },
    update: {},
    create: {
      trackingCode: 'MNC-7723C',
      pickupPin: '6104',
      description: '12 Cartons Tissus Wax & Soie Guangzhou',
      quantity: 12,
      transportMode: 'MARITIME_LCL',
      cbm: 3.5,
      weight: 420,
      appliedRate: 160000, // VIP discount (normal is 165000)
      totalAmount: 560000,
      status: 'IN_TRANSIT',
      clientId: client1.id,
      containerId: container2.id
    }
  });

  await prisma.payment.deleteMany({ where: { shipmentId: shipment3.id } });
  await prisma.payment.create({
    data: {
      receiptNum: 'REC-2026-003',
      amount: 200000,
      method: 'BANK_TRANSFER',
      reference: 'VIR-CBAO-88192',
      shipmentId: shipment3.id
    }
  });

  // Shipment 4: MNC-9914D (Maritime LCL, Delivered)
  const shipment4 = await prisma.shipment.upsert({
    where: { trackingCode: 'MNC-9914D' },
    update: {
      description: 'Échantillons Pièces Électroniques Guangzhou (Maritime LCL)',
      transportMode: 'MARITIME_LCL'
    },
    create: {
      trackingCode: 'MNC-9914D',
      pickupPin: '1159',
      description: 'Échantillons Pièces Électroniques Guangzhou (Maritime LCL)',
      quantity: 1,
      transportMode: 'MARITIME_LCL',
      cbm: 1.0,
      weight: 15.0,
      appliedRate: 165000,
      totalAmount: 165000,
      status: 'DELIVERED',
      clientId: client2.id
    }
  });

  await prisma.payment.deleteMany({ where: { shipmentId: shipment4.id } });
  await prisma.payment.create({
    data: {
      receiptNum: 'REC-2026-004',
      amount: 165000,
      method: 'CASH',
      reference: 'RECU-ESPECES-01',
      shipmentId: shipment4.id
    }
  });

  console.log('--- Seeding finished successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

