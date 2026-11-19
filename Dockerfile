# ==============================================================================
# MINANE CARGO — Dockerfile Multi-Stage Unifié Tout-en-Un (All-in-One)
# Frontend React (Vite) + Backend Node.js (Express) + Base PostgreSQL intégrée
# Conçu pour déploiement en 1 seul conteneur sur Render (Free Tier sans expiration)
# ==============================================================================

# ─── ÉTAPE 1 : Compilation du Frontend React ──────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copie des fichiers de dépendances du frontend
COPY minane_app/frontend/package*.json ./
RUN npm ci

# Copie de l'ensemble du code frontend et build de production
COPY minane_app/frontend/ ./
RUN npm run build

# ─── ÉTAPE 2 : Image d'exécution Backend + PostgreSQL + SPA Serveur ───────────
FROM node:20-alpine AS runner
WORKDIR /app

# Installation des dépendances système : OpenSSL (Prisma), PostgreSQL et su-exec
RUN apk add --no-cache openssl postgresql postgresql-contrib su-exec

# Préparation des dossiers PostgreSQL pour l'utilisateur système postgres
RUN mkdir -p /var/lib/postgresql/data /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql && \
    chmod 0700 /var/lib/postgresql/data /run/postgresql

# Copie des dépendances du backend et du schéma Prisma
COPY minane_app/backend/package*.json ./
COPY minane_app/backend/prisma ./prisma/

# Installation des dépendances Node.js et génération du client Prisma
RUN npm ci --omit=dev && npx prisma generate

# Copie des sources du backend
COPY minane_app/backend/src ./src/

# Copie du script d'initialisation et démarrage tout-en-un
COPY minane_app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copie des fichiers compilés du frontend depuis l'Étape 1
COPY --from=frontend-builder /app/frontend/dist ./public_frontend

# Configuration des variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_BUILD_PATH=/app/public_frontend
ENV PGDATA=/var/lib/postgresql/data

# Volume optionnel pour la persistance des données sur Render Disk ou Docker Volume
VOLUME ["/var/lib/postgresql/data"]

# Port exposé (Render injecte automatiquement la variable PORT)
EXPOSE 5000

# Démarrage avec le script d'entrée (PostgreSQL + Prisma push/seed + Express)
CMD ["./docker-entrypoint.sh"]
