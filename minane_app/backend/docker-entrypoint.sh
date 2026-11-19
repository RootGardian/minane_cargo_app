#!/bin/sh
set -e

echo "=========================================================="
echo "🚢 Minane Cargo — Démarrage du Conteneur Tout-en-Un"
echo "=========================================================="

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
export PGDATA

# 1. Vérifier si une base distante est configurée ou s'il faut démarrer PostgreSQL local
if [ -n "$DATABASE_URL" ] && ! echo "$DATABASE_URL" | grep -qE "localhost|127\.0\.0\.1"; then
  echo "🌐 Utilisation de la base de données distante fournie : $DATABASE_URL"
else
  echo "🐘 Configuration et lancement du PostgreSQL local embarqué..."
  
  # Initialisation du cluster si PG_VERSION n'existe pas encore
  if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "⚙️ Initialisation d'une nouvelle base PostgreSQL..."
    chown -R postgres:postgres "$PGDATA" /run/postgresql 2>/dev/null || true
    su-exec postgres initdb -D "$PGDATA" --auth-local=trust --auth-host=trust -E UTF8 > /dev/null
    
    # Tuning léger pour conteneur 512 Mo
    echo "listen_addresses = '127.0.0.1'" >> "$PGDATA/postgresql.conf"
    echo "shared_buffers = 64MB" >> "$PGDATA/postgresql.conf"
    echo "max_connections = 60" >> "$PGDATA/postgresql.conf"
    echo "host all all 127.0.0.1/32 trust" > "$PGDATA/pg_hba.conf"
    echo "local all all trust" >> "$PGDATA/pg_hba.conf"
  fi

  # Démarrage de PostgreSQL en arrière-plan
  echo "🚀 Démarrage du service PostgreSQL..."
  su-exec postgres pg_ctl -D "$PGDATA" -o "-k /run/postgresql" -w start

  # Création du rôle et de la base si inexistants
  echo "🔑 Vérification de l'utilisateur et de la base minane_db..."
  su-exec postgres psql -U postgres -v ON_ERROR_STOP=1 <<-EOSQL > /dev/null 2>&1
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'minane_user') THEN
        CREATE ROLE minane_user WITH LOGIN PASSWORD 'minane_password' SUPERUSER CREATEDB;
      END IF;
    END
    \$\$;
EOSQL

  su-exec postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'minane_db'" | grep -q 1 || \
    su-exec postgres psql -U postgres -c "CREATE DATABASE minane_db OWNER minane_user;" > /dev/null 2>&1

  export DATABASE_URL="postgresql://minane_user:minane_password@127.0.0.1:5432/minane_db?schema=public"
  echo "✅ Base PostgreSQL locale active et connectée."
fi

# 2. Synchronisation automatique du schéma Prisma
echo "📦 Synchronisation du schéma Prisma (db push)..."
npx prisma db push --skip-generate --accept-data-loss || echo "⚠️ Avertissement db push, poursuite..."

# 3. Seed automatique des données initiales si table vide
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

# 4. Fonction d'arrêt propre (SIGTERM / SIGINT)
cleanup() {
  echo "🛑 Signal d'arrêt reçu, fermeture propre des services..."
  if [ -n "$NODE_PID" ]; then
    kill -TERM "$NODE_PID" 2>/dev/null || true
  fi
  if [ -s "$PGDATA/postmaster.pid" ]; then
    echo "🐘 Arrêt de PostgreSQL..."
    su-exec postgres pg_ctl -D "$PGDATA" -m fast stop || true
  fi
  exit 0
}

trap cleanup SIGTERM SIGINT

# 5. Lancement du serveur Node.js Express (Frontend SPA + API REST)
echo "🚀 Lancement de Minane Cargo sur le port \${PORT:-5000}..."
node src/index.js &
NODE_PID=$!

wait "$NODE_PID"
