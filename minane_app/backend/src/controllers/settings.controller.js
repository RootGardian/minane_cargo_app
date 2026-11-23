const prisma = require('../prisma');

/**
 * SettingsController — Contrôleur MVC pour les paramètres globaux et coordonnées officielles
 */
const settingsController = {
  /**
   * GET /api/settings (Public)
   */
  async get(req, res) {
    try {
      let settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            id: 1,
            maritimeCbmRate: 165000,
            airNormalKgRate: 8500,
            airExpressKgRate: 11000,
            nextCutoffDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            nextLoadingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            nextEstimatedArrival: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
            announcementBanner: 'Ligne maritime directe Guangzhou ➔ Port de Dakar • Réception continue de colis en entrepôts.'
          }
        });
      }
      res.json(settings);
    } catch (error) {
      console.error('[SettingsController.get]', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des paramètres.' });
    }
  },

  /**
   * PUT /api/settings (Admin)
   */
  async update(req, res) {
    try {
      const {
        maritimeCbmRate,
        airNormalKgRate,
        airExpressKgRate,
        nextCutoffDate,
        nextLoadingDate,
        nextEstimatedArrival,
        nextAirCutoffDate,
        nextAirDepartureDate,
        nextAirArrivalDate,
        announcementBanner,
        phoneDakar,
        phoneGuangzhou,
        phoneGuangzhouSn,
        addressDakar,
        addressGuangzhou
      } = req.body;

      let cleanMaritimeRate = undefined;
      if (maritimeCbmRate !== undefined && maritimeCbmRate !== null && maritimeCbmRate !== '') {
        const parsed = parseInt(maritimeCbmRate, 10);
        if (isNaN(parsed) || parsed < 1000 || parsed > 50000000) {
          return res.status(400).json({ error: 'Tarif maritime invalide (doit être compris entre 1 000 et 50 000 000 FCFA).' });
        }
        cleanMaritimeRate = parsed;
      }

      let cleanAirNormalRate = undefined;
      if (airNormalKgRate !== undefined && airNormalKgRate !== null && airNormalKgRate !== '') {
        const parsed = parseInt(airNormalKgRate, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 5000000) cleanAirNormalRate = parsed;
      }

      let cleanAirExpressRate = undefined;
      if (airExpressKgRate !== undefined && airExpressKgRate !== null && airExpressKgRate !== '') {
        const parsed = parseInt(airExpressKgRate, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 5000000) cleanAirExpressRate = parsed;
      }

      const cleanCutoff = nextCutoffDate && !isNaN(new Date(nextCutoffDate).getTime()) ? new Date(nextCutoffDate) : null;
      const cleanLoading = nextLoadingDate && !isNaN(new Date(nextLoadingDate).getTime()) ? new Date(nextLoadingDate) : null;
      const cleanArrival = nextEstimatedArrival && !isNaN(new Date(nextEstimatedArrival).getTime()) ? new Date(nextEstimatedArrival) : null;

      const cleanAirCutoff = nextAirCutoffDate && !isNaN(new Date(nextAirCutoffDate).getTime()) ? new Date(nextAirCutoffDate) : null;
      const cleanAirDeparture = nextAirDepartureDate && !isNaN(new Date(nextAirDepartureDate).getTime()) ? new Date(nextAirDepartureDate) : null;
      const cleanAirArrival = nextAirArrivalDate && !isNaN(new Date(nextAirArrivalDate).getTime()) ? new Date(nextAirArrivalDate) : null;

      const cleanBanner = announcementBanner ? announcementBanner.toString().substring(0, 300) : null;

      const cleanPhoneDakar = phoneDakar !== undefined ? String(phoneDakar).trim().substring(0, 50) : undefined;
      const cleanPhoneGz = phoneGuangzhou !== undefined ? String(phoneGuangzhou).trim().substring(0, 50) : undefined;
      const cleanPhoneGzSn = phoneGuangzhouSn !== undefined ? String(phoneGuangzhouSn).trim().substring(0, 50) : undefined;
      const cleanAddressDakar = addressDakar !== undefined ? String(addressDakar).trim().substring(0, 250) : undefined;
      const cleanAddressGz = addressGuangzhou !== undefined ? String(addressGuangzhou).trim().substring(0, 250) : undefined;

      const updated = await prisma.appSettings.upsert({
        where: { id: 1 },
        update: {
          ...(cleanMaritimeRate !== undefined && { maritimeCbmRate: cleanMaritimeRate }),
          ...(cleanAirNormalRate !== undefined && { airNormalKgRate: cleanAirNormalRate }),
          ...(cleanAirExpressRate !== undefined && { airExpressKgRate: cleanAirExpressRate }),
          ...(nextCutoffDate !== undefined && { nextCutoffDate: cleanCutoff }),
          ...(nextLoadingDate !== undefined && { nextLoadingDate: cleanLoading }),
          ...(nextEstimatedArrival !== undefined && { nextEstimatedArrival: cleanArrival }),
          ...(nextAirCutoffDate !== undefined && { nextAirCutoffDate: cleanAirCutoff }),
          ...(nextAirDepartureDate !== undefined && { nextAirDepartureDate: cleanAirDeparture }),
          ...(nextAirArrivalDate !== undefined && { nextAirArrivalDate: cleanAirArrival }),
          ...(announcementBanner !== undefined && { announcementBanner: cleanBanner }),
          ...(cleanPhoneDakar !== undefined && { phoneDakar: cleanPhoneDakar }),
          ...(cleanPhoneGz !== undefined && { phoneGuangzhou: cleanPhoneGz }),
          ...(cleanPhoneGzSn !== undefined && { phoneGuangzhouSn: cleanPhoneGzSn }),
          ...(cleanAddressDakar !== undefined && { addressDakar: cleanAddressDakar }),
          ...(cleanAddressGz !== undefined && { addressGuangzhou: cleanAddressGz })
        },
        create: {
          id: 1,
          maritimeCbmRate: cleanMaritimeRate || 165000,
          airNormalKgRate: cleanAirNormalRate || 8500,
          airExpressKgRate: cleanAirExpressRate || 11000,
          nextCutoffDate: cleanCutoff,
          nextLoadingDate: cleanLoading,
          nextEstimatedArrival: cleanArrival,
          nextAirCutoffDate: cleanAirCutoff,
          nextAirDepartureDate: cleanAirDeparture,
          nextAirArrivalDate: cleanAirArrival,
          announcementBanner: cleanBanner,
          phoneDakar: cleanPhoneDakar || '+221 70 596 12 76',
          phoneGuangzhou: cleanPhoneGz || '+86 137 1104 5051',
          phoneGuangzhouSn: cleanPhoneGzSn || '+221 70 596 12 76',
          addressDakar: cleanAddressDakar || 'Dakar',
          addressGuangzhou: cleanAddressGz || 'Room C12, 3/F Yidong Building, No. 301 Huanshi Zhong Road, Guangzhou'
        }
      });

      res.json({ message: 'Paramètres mis à jour avec succès.', settings: updated });
    } catch (error) {
      console.error('[SettingsController.update]', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres.' });
    }
  }
};

module.exports = settingsController;

