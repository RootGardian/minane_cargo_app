#!/bin/sh
set -e

echo "=========================================================="
echo "🚢 Minane Cargo — Démarrage du conteneur de production"
echo "=========================================================="

# 1. Synchronisation automatique du schéma de la base de données (si DATABASE_URL configurée)
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Vérification et synchronisation du schéma PostgreSQL..."
  npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ Avertissement db push, démarrage du serveur..."
  
  # Optionnel : initialiser les données si la base vient d'être créée
  echo "🌱 Vérification de l'initialisation des paramètres..."
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.appSettings.findFirst()
      .then(s => {
        if (!s) {
          console.log('⚡ Initialisation des données de base Minane Cargo...');
          require('./prisma/seed.js');
        } else {
          console.log('✅ Base de données déjà initialisée.');
          process.exit(0);
        }
      })
      .catch(err => {
        console.warn('⚠️ Erreur vérification seed:', err.message);
        process.exit(0);
      });
  " || true
else
  echo "⚠️ Aucune variable DATABASE_URL trouvée. Assurez-vous de la configurer sur Render."
fi

# 2. Démarrage de l'application Node.js
echo "🚀 Lancement de l'application sur le port ${PORT:-5000}..."
exec node src/index.js

