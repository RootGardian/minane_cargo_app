# ==============================================================================
# MINANE CARGO — Dockerfile Multi-Stage Unifié (Frontend Vite + Backend Express)
# Conçu pour déploiement en 1 clic sur Render (Web Service Docker)
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

# ─── ÉTAPE 2 : Image d'exécution Backend & Serveur ────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Installation des dépendances système requises par Prisma sur Alpine Linux
RUN apk add --no-cache openssl

# Copie des dépendances du backend et du schéma Prisma
COPY minane_app/backend/package*.json ./
COPY minane_app/backend/prisma ./prisma/

# Installation des dépendances Node.js et génération du client Prisma
RUN npm ci --omit=dev && npx prisma generate

# Copie des sources du backend
COPY minane_app/backend/src ./src/

# Copie du script d'initialisation et démarrage
COPY minane_app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copie des fichiers compilés du frontend depuis l'Étape 1
COPY --from=frontend-builder /app/frontend/dist ./public_frontend

# Configuration des variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_BUILD_PATH=/app/public_frontend

# Port exposé (Render injecte automatiquement la variable PORT)
EXPOSE 5000

# Démarrage avec le script d'entrée (synchronisation Prisma + lancement Node)
CMD ["./docker-entrypoint.sh"]

