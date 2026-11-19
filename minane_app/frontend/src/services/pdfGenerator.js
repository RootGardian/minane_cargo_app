import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatFCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getModeLabel = (mode) => {
  switch (mode) {
    case 'MARITIME_LCL': return 'Maritime Groupage (LCL)';
    case 'MARITIME_FCL': return 'Conteneur Maritime Plein (FCL)';
    default: return mode;
  }
};

/**
 * Generates an official Minane Cargo Invoice 100% on the fly in the browser
 * Identity: Deep Navy #042442 (4, 36, 66) & Accent Red #E2001A (226, 0, 26)
 */
export function generateInvoicePDF(shipment) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band: Deep Navy #042442
  doc.setFillColor(4, 36, 66);
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MINANE CARGO', 14, 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('BETTER WAYS • CORRIDOR CHINE ➔ SÉNÉGAL', pageWidth - 14, 17, { align: 'right' });

  // Invoice Reference and Metadata Box
  doc.setTextColor(4, 36, 66);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE DE FRET & TRANSIT', 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Réf Facture : FAC-${shipment.trackingCode}`, 14, 48);
  doc.text(`Date d'émission : ${formatDate(new Date())}`, 14, 54);
  doc.text(`Code de suivi : ${shipment.trackingCode}`, 14, 60);

  // Client Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(244, 246, 249);
  doc.rect(pageWidth - 95, 34, 81, 30, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 36, 66);
  doc.text('DESTINATAIRE / CLIENT :', pageWidth - 90, 42);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(11, 31, 51);
  doc.text(shipment.client?.fullName || shipment.senderName || 'Client Minane Cargo', pageWidth - 90, 48);
  doc.text(`Tél : ${shipment.client?.phone || 'Non renseigné'}`, pageWidth - 90, 54);
  if (shipment.client?.address) {
    doc.text(shipment.client.address.substring(0, 32), pageWidth - 90, 60);
  }

  // Corridor Routing Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 36, 66);
  doc.text('ITINÉRAIRE & CARACTÉRISTIQUES DU COLIS', 14, 74);

  const routingInfo = [
    ['Origine', 'Chine (Guangzhou  )'],
    ['Destination', 'Dakar, Sénégal (Port Môle 2 /  Dakar)'],
    ['Type de transport', getModeLabel(shipment.shippingMode)],
    ['Conteneur de rattachement', shipment.container?.containerNumber || 'En cours de groupage'],
    ['Nombre de colis / cartons', `${shipment.packageCount || 1} carton(s)`],
    ['Volume (CBM)', shipment.cbm ? `${shipment.cbm.toFixed(3)} m³` : 'N/A'],
    ['Poids brut (Kg)', shipment.weight ? `${shipment.weight.toFixed(1)} kg` : 'N/A']
  ];

  doc.autoTable({
    startY: 78,
    head: [['Paramètre', 'Détail de l\'expédition']],
    body: routingInfo,
    theme: 'grid',
    headStyles: { fillColor: [4, 36, 66], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 }
  });

  // Financial Breakdown
  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 36, 66);
  doc.text('DÉCOMPTE FINANCIER & RÈGLEMENT', 14, finalY);

  const financialItems = [
    [
      `Fret International Chine ➔ Dakar (${getModeLabel(shipment.shippingMode)})`,
      shipment.cbm ? `${shipment.cbm.toFixed(3)} CBM` : `${shipment.weight || 1} Kg`,
      formatFCFA(shipment.totalAmount)
    ],
    [
      'Frais de manutention, dégroupage & formalités portuaires',
      'Inclus',
      '0 FCFA'
    ]
  ];

  doc.autoTable({
    startY: finalY + 4,
    head: [['Désignation de la prestation', 'Quantité / Base', 'Montant Total']],
    body: financialItems,
    theme: 'striped',
    headStyles: { fillColor: [4, 36, 66], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
  });

  // Totals Box
  const totalsY = doc.lastAutoTable.finalY + 6;
  const totalPaid = shipment.paidAmount || 0;
  const remaining = Math.max(0, shipment.totalAmount - totalPaid);

  doc.setDrawColor(226, 232, 240);
  doc.rect(pageWidth - 95, totalsY, 81, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Montant total dû :', pageWidth - 90, totalsY + 8);
  doc.text('Versements reçus :', pageWidth - 90, totalsY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 36, 66);
  doc.text(formatFCFA(shipment.totalAmount), pageWidth - 18, totalsY + 8, { align: 'right' });
  doc.text(formatFCFA(totalPaid), pageWidth - 18, totalsY + 16, { align: 'right' });

  // Remaining balance highlight
  doc.setFillColor(remaining > 0 ? 254 : 240, remaining > 0 ? 242 : 253, remaining > 0 ? 242 : 244);
  doc.rect(pageWidth - 95, totalsY + 20, 81, 10, 'F');
  doc.setTextColor(remaining > 0 ? 226 : 16, remaining > 0 ? 0 : 185, remaining > 0 ? 26 : 129); // Accent red #E2001A
  doc.text('RESTE À PAYER :', pageWidth - 90, totalsY + 27);
  doc.text(formatFCFA(remaining), pageWidth - 18, totalsY + 27, { align: 'right' });

  // Pickup Security PIN code
  if (shipment.pickupPin) {
    doc.setDrawColor(226, 0, 26); // Red border
    doc.setFillColor(254, 242, 242);
    doc.rect(14, totalsY, 80, 30, 'FD');
    doc.setTextColor(226, 0, 26);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CODE PIN DE RETRAIT SÉCURISÉ (OTP)', 18, totalsY + 9);
    doc.setFontSize(18);
    doc.text(shipment.pickupPin, 18, totalsY + 21);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('À présenter impérativement lors du dépotage à Dakar.', 18, totalsY + 27);
  }

  // Footer notes & Legal
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Conditions : Les marchandises voyagent aux risques et périls de l\'ayant droit.', 14, 275);
  doc.text('Siège Dakar : Môle 2 Port Autonome de Dakar / Allées  Dakar — Tél : +221 70 596 12 76 — www.minanecargo.sn', 14, 280);
  doc.text('Bureaux Chine : Guangzhou (Yuexiu District) &  (International Trade City)', 14, 285);

  doc.save(`Facture_MinaneCargo_${shipment.trackingCode}.pdf`);
}

/**
 * Generates an official payment receipt for each installment
 */
export function generateReceiptPDF(payment, shipment) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Receipt Navy Header
  doc.setFillColor(4, 36, 66);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MINANE CARGO — REÇU DE CAISSE', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('BETTER WAYS • SÉNÉGAL', pageWidth - 14, 16, { align: 'right' });

  // Receipt Details
  doc.setTextColor(4, 36, 66);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`REÇU N° ${payment.id ? payment.id.substring(0, 8).toUpperCase() : 'REC-' + Date.now()}`, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date d'encaissement : ${formatDate(payment.createdAt || new Date())}`, 14, 46);
  doc.text(`Référence Colis : ${shipment?.trackingCode || 'N/A'}`, 14, 52);

  // Box Payment Details
  const paymentDetails = [
    ['Client / Payeur', shipment?.client?.fullName || shipment?.senderName || 'Client Minane Cargo'],
    ['Téléphone', shipment?.client?.phone || 'N/A'],
    ['Mode de paiement', payment.method],
    ['Référence Transaction / Bordereau', payment.reference || 'Paiement direct en agence'],
    ['Montant Encaissé', formatFCFA(payment.amount)],
    ['Statut de validation', 'CONFIRMÉ & ENCAISSÉ']
  ];

  doc.autoTable({
    startY: 58,
    head: [['Champ', 'Valeur enregistrée']],
    body: paymentDetails,
    theme: 'grid',
    headStyles: { fillColor: [4, 36, 66], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 1: { fontStyle: 'bold' } }
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // Box Stamp and Signature
  doc.setDrawColor(226, 232, 240);
  doc.rect(pageWidth - 80, finalY, 66, 32);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Cachet de la Caisse & Signature :', pageWidth - 76, finalY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 36, 66);
  doc.text('MINANE CARGO DAKAR', pageWidth - 76, finalY + 26);

  doc.save(`Recu_${payment.id ? payment.id.substring(0, 6) : 'paiement'}_${shipment?.trackingCode || ''}.pdf`);
}
