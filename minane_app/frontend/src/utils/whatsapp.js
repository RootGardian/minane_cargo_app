/**
 * Utilitaires pour le partage et le support WhatsApp (Minane Cargo)
 */
import { DEFAULT_COMPANY_INFO, cleanPhoneForWA } from './company';

export const formatPhoneForWA = (phone) => {
  return cleanPhoneForWA(phone || DEFAULT_COMPANY_INFO.phoneDakar);
};

export const getWAShareUrl = ({
  phone,
  trackingCode,
  recipientName,
  pickupPin,
  remainingBalance,
  statusLabel,
  phoneDakar,
}) => {
  const cleanPhone = formatPhoneForWA(phone);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const trackingLink = `${origin}/?track=${trackingCode}`;
  const dakarNumber = phoneDakar || DEFAULT_COMPANY_INFO.phoneDakar;

  const financialStatus =
    Number(remainingBalance) > 0
      ? `*Reste à payer : ${new Intl.NumberFormat('fr-FR').format(remainingBalance)} FCFA*`
      : '*Soldé (0 FCFA)* ';

  const lines = [
    `*MINANE CARGO* — _Avis de prise en charge_ `,
    ``,
    `Bonjour,`,
    `Nous vous confirmons l'enregistrement de votre expédition au sein de notre entrepôt de Guangzhou.`,
    ``,
    `*RÉCAPITULATIF DE L'ENVOI*`,
    recipientName ? `▪ *Client :* ${recipientName}` : null,
    `▪ *N° de suivi :* \`${trackingCode}\``,
    pickupPin ? `▪ *Code PIN de retrait :* \`${pickupPin}\`` : null,
    `▪ *Statut financier :* ${financialStatus}`,
    statusLabel ? `▪ *Statut logistique :* *${statusLabel}*` : null,
    ``,
    `*SUIVI EN TEMPS RÉEL*`,
    `Consultez l'avancement de votre colis à tout moment :`,
    `${trackingLink}`,
    ``,
    `Consigne de sécurité : Ce code PIN personnel est strictement confidentiel. Il vous sera demandé au guichet lors du retrait à Dakar.`,
    ``,
    `*Service Client Minane Cargo*`,
    ` Dakar : ${dakarNumber}`
  ].filter(Boolean);

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
};

export const getWASupportUrl = (trackingCode = '', context = '', customPhone) => {
  const phoneToUse = formatPhoneForWA(customPhone || DEFAULT_COMPANY_INFO.phoneDakar);
  let text = `Bonjour *Minane Cargo*,\n\n`;
  text += `Je souhaite obtenir une assistance concernant mon expédition`;

  if (trackingCode) {
    text += ` (Réf. : \`${trackingCode}\`)`;
  }
  if (context) {
    text += ` au sujet de : *${context}*`;
  }

  text += `.\n\nMerci d'avance pour votre retour.`;

  return `https://wa.me/${phoneToUse}?text=${encodeURIComponent(text)}`;
};
