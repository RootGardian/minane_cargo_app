/**
 * client.routes.js — Route désactivée (portail grossiste supprimé)
 * Remplacée par l'administration centralisée via AdminDashboard
 */
const express = require('express');
const router = express.Router();

// Route désactivée — retourne 410 Gone
router.all('*', (req, res) => {
  res.status(410).json({
    error: 'Ce portail n\'est plus disponible. Contactez l\'administration Minane Cargo.'
  });
});

module.exports = router;
