# ==============================================================================
# MINANE CARGO — Dockerfile Multi-Stage Tout-en-Un (si Root Directory = minane_app)
# Frontend React + Backend Express + PostgreSQL Embarqué
# ==============================================================================

# ─── ÉTAPE 1 : Compilation du Frontend React ──────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ─── ÉTAPE 2 : Image d'exécution Backend + PostgreSQL + SPA ───────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl postgresql postgresql-contrib su-exec

RUN mkdir -p /var/lib/postgresql/data /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql && \
    chmod 0700 /var/lib/postgresql/data /run/postgresql

COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY backend/src ./src/
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

COPY --from=frontend-builder /app/frontend/dist ./public_frontend

ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_BUILD_PATH=/app/public_frontend
ENV PGDATA=/var/lib/postgresql/data

VOLUME ["/var/lib/postgresql/data"]

EXPOSE 5000

CMD ["./docker-entrypoint.sh"]
