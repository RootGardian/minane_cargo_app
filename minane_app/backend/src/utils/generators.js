const crypto = require('crypto');

/**
 * Normalizes Senegalese phone numbers for WhatsApp links (221XXXXXXXXX)
 */
function normalizePhoneNumber(phone) {
  let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('00221')) {
    cleanPhone = cleanPhone.slice(2);
  }
  if (!cleanPhone.startsWith('221') && cleanPhone.length === 9) {
    cleanPhone = '221' + cleanPhone;
  }
  return cleanPhone;
}

/**
 * Generates tracking code format: MNC-XXXXX (e.g. MNC-8492A)
 * Uses crypto.randomInt for better collision resistance
 */
function generateTrackingCode() {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'MNC-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return result;
}

/**
 * Generates 4-digit pickup PIN (e.g. 4821)
 */
function generatePickupPin() {
  return crypto.randomInt(1000, 10000).toString();
}

/**
 * Generates unique receipt number format: REC-YYYY-XXXX
 */
function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const rand = crypto.randomInt(1000, 10000);
  return `REC-${year}-${rand}`;
}

/**
 * Formats transport mode for display
 */
function formatTransportMode(mode) {
  switch (mode) {
    case 'MARITIME_LCL': return 'Maritime — Groupage (LCL)';
    case 'MARITIME_FCL': return 'Maritime — Conteneur Complet (FCL)';
    case 'AIR_NORMAL': return 'Fret Aérien — Groupage Standard (7-10j)';
    case 'AIR_EXPRESS': return 'Fret Aérien — Express (3-5j)';
    default: return 'Fret Commercial';
  }
}

/**
 * Returns the production tracking URL or localhost for dev
 */
function getTrackingUrl(trackingCode) {
  const baseUrl = (process.env.APP_URL || 'https://minane-cargo-app.blackcoretech.duckdns.org').replace(/\/$/, '');
  return `${baseUrl}/?track=${trackingCode}`;
}

/**
 * Generates WhatsApp notification message for new shipment
 */
function generateWhatsAppShareUrl(phone, trackingCode, pin, description, remainingBalance = 0, transportMode = 'MARITIME_LCL', options = {}) {
  const cleanPhone = normalizePhoneNumber(phone);
  const trackingUrl = getTrackingUrl(trackingCode);
  const dakarPhone = options.phoneDakar || process.env.PHONE_DAKAR || '+221 70 596 12 76';

  const financialStatus = remainingBalance > 0
    ? `*Reste à payer : ${Number(remainingBalance).toLocaleString('fr-FR')} FCFA*`
    : '*Soldé*';

  const message =
    `*MINANE CARGO* — _Avis d'expédition_

Bonjour,
Nous vous confirmons l'enregistrement de votre expédition au sein de notre entrepôt de Guangzhou.

*RÉCAPITULATIF DE L'ENVOI*
- *Marchandise :* 
${description}
- *N° de suivi :* 
\`${trackingCode}\`
- *Code PIN de retrait :* 
\`${pin}\`


*SUIVI EN TEMPS RÉEL*
Consultez l'avancement de votre colis à tout moment :
${trackingUrl}

Consigne de sécurité : Ce code PIN personnel est strictement confidentiel. Il vous sera demandé au guichet lors du retrait à Dakar.


*Service Client Minane Cargo*
 Dakar : ${dakarPhone}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp message for delivery notification (colis arrivé)
 */
function generateArrivalNotificationUrl(phone, trackingCode, pin, description, remainingBalance = 0, options = {}) {
  const cleanPhone = normalizePhoneNumber(phone);
  const trackingUrl = getTrackingUrl(trackingCode);
  const dakarPhone = options.phoneDakar || process.env.PHONE_DAKAR || '+221 70 596 12 76';
  const dakarAddress = options.addressDakar || 'Dakar';

  const paymentLine = remainingBalance > 0
    ? `- *Solde à régler au retrait :* *${Number(remainingBalance).toLocaleString('fr-FR')} FCFA*\n`
    : '- *Statut financier :* *Soldé (0 FCFA)*\n';

  const message =
    `*MINANE CARGO — Votre colis est arrivé à Dakar !*
━━━━━━━━━━━━━━━━━━━━━━

Bonne nouvelle ! Votre expédition est prête à être retirée.

- *Colis :* ${description}
- *Référence :* \`${trackingCode}\`
- *PIN de retrait :* \`${pin}\`
${paymentLine}
*Lieu de retrait :*
Minane Cargo — ${dakarAddress}

*Suivi & détails :*
${trackingUrl}

*Service Client Minane Cargo*
 Dakar : ${dakarPhone}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  generateTrackingCode,
  generatePickupPin,
  generateReceiptNumber,
  generateWhatsAppShareUrl,
  generateArrivalNotificationUrl,
  formatTransportMode,
  getTrackingUrl
};