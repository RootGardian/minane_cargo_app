/**
 * Informations officielles et dynamiques de l'entreprise Minane Cargo
 * Tous les numéros et adresses sont configurables via l'onglet Paramètres (Admin)
 */

export const DEFAULT_COMPANY_INFO = {
  // Dakar (Sénégal) : l'agence à Dakar s'écrit juste "Dakar"
  name: 'Minane Cargo',
  addressDakar: 'Dakar',
  phoneDakar: '+221 70 596 12 76',

  // Guangzhou (Chine) : vraies infos de Minane Cargo
  addressGuangzhou: 'Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road, Guangzhou',
  phoneGuangzhou: '+86 137 1104 5051',
  phoneGuangzhouSn: '+221 70 596 12 76',
};

/**
 * Retourne les infos d'entreprise en combinant les paramètres dynamiques
 * (récupérés de l'API /api/settings) et les valeurs officielles par défaut.
 */
export function getCompanyInfo(settings) {
  return {
    name: DEFAULT_COMPANY_INFO.name,
    addressDakar: (settings?.addressDakar && settings.addressDakar.trim()) || DEFAULT_COMPANY_INFO.addressDakar,
    phoneDakar: (settings?.phoneDakar && settings.phoneDakar.trim()) || DEFAULT_COMPANY_INFO.phoneDakar,
    addressGuangzhou: (settings?.addressGuangzhou && settings.addressGuangzhou.trim()) || DEFAULT_COMPANY_INFO.addressGuangzhou,
    phoneGuangzhou: (settings?.phoneGuangzhou && settings.phoneGuangzhou.trim()) || DEFAULT_COMPANY_INFO.phoneGuangzhou,
    phoneGuangzhouSn: (settings?.phoneGuangzhouSn && settings.phoneGuangzhouSn.trim()) || DEFAULT_COMPANY_INFO.phoneGuangzhouSn,
  };
}

/**
 * Nettoie un numéro de téléphone pour WhatsApp (ex: +221 70 596 12 76 -> 221705961276)
 */
export function cleanPhoneForWA(phone) {
  if (!phone) return '221705961276';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.startsWith('00')) clean = clean.slice(2);
  if (!clean.startsWith('221') && clean.length === 9) {
    clean = '221' + clean;
  }
  return clean || '221705961276';
}

/**
 * Génère un lien direct WhatsApp pour contacter le support
 */
export function getWaChatUrl(phone, text = '') {
  const clean = cleanPhoneForWA(phone);
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${clean}${encodedText}`;
}

/**
 * Génère le lien WhatsApp du support client de Dakar
 */
export function getDakarSupportWaUrl(settings, message) {
  const info = getCompanyInfo(settings);
  const defaultMsg = message || "Bonjour Minane Cargo, je souhaite des informations sur mes expéditions.";
  return getWaChatUrl(info.phoneDakar, defaultMsg);
}

