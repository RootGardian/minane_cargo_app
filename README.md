# 🚢 Minane Cargo — Plateforme Maritime Full-Stack (Chine ➔ Sénégal)

[![Security Tests](https://img.shields.io/badge/Security_Tests-50%2F50_Passing-brightgreen.svg)](#-sécurité--conformité)
[![Stack](https://img.shields.io/badge/Stack-React_18_%7C_Node.js_%7C_Prisma_%7C_PostgreSQL-blue.svg)](#-stack-technique)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Unified-2496ED.svg?logo=docker)](#-déploiement-docker--render)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

Plateforme web métier de gestion de fret maritime et de suivi de colis conteneurisés opérant sur le corridor logistique **Chine (Guangzhou / Yiwu) ➔ Sénégal (Port de Dakar)**.

---

## 📑 Sommaire
- [Vue d'ensemble du projet](#-vue-densemble)
- [Stack Technique](#-stack-technique)
- [Structure du Projet](#-structure-du-projet)
- [Démarrage Rapide (Développeur)](#-démarrage-rapide)
- [Identifiants de Test](#-identifiants-de-test)
- [Sécurité & Conformité](#-sécurité--conformité)
- [Répertoire des Endpoints API](#-répertoire-des-endpoints-api)
- [Déploiement Docker & Render](#-déploiement-docker--render)
- [Documentation Complémentaire](#-documentation-complémentaire)

---

## 🌍 Vue d'ensemble

Minane Cargo gère la logistique maritime complète entre la Chine et le Sénégal :
1. **Réception & Cubage CBM** dans nos entrepôts de Guangzhou.
2. **Attribution automatique d'un code de suivi unique** (`MNC-XXXXX`) et d'un **code PIN secret** de retrait à 4 chiffres.
3. **Notification WhatsApp automatique** du client avec lien de suivi direct et détails financiers.
4. **Empotage et scellage des conteneurs** (LCL Groupage et FCL Conteneur Complet).
5. **Dédouanement et mise à disposition au guichet de Dakar** : retrait strictement sécurisé sur présentation d'une pièce d'identité et du PIN.

---

## 🛠 Stack Technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js (v20+), Express 4, Prisma ORM 5.22 |
| **Base de Données** | PostgreSQL 15+ (avec index B-tree sur colonnes critiques) |
| **Sécurité** | JWT HS256 (128-char secret), Sanitizer anti-XSS/Prototype Pollution, SQL Guard, CSP, Rate Limiting |
| **Génération Documents** | `jsPDF` + `jspdf-autotable` (génération 100% côté client, Zero-Storage serveur) |
| **Conteneurisation** | Docker Multi-Stage (Vite builder + Express runner unifiés) |

---

## 📁 Structure du Projet

```text
miname_cargo/
├── Dockerfile                  # Build multi-stage Docker unifié
├── render.yaml                 # Blueprint de déploiement 1-clic Render
├── package.json                # Scripts d'orchestration globaux du workspace
├── DEPLOY_RENDER.md            # Guide pas-à-pas de déploiement cloud
├── ARCHITECTURE.md             # Documentation d'architecture logicielle & BDD
├── CONTRIBUTING.md             # Guide de contribution pour les développeurs
│
└── minane_app/
    ├── backend/
    │   ├── src/
    │   │   ├── index.js        # Point d'entrée Express & service statique
    │   │   ├── controllers/    # Contrôleurs MVC (Auth, Shipment, Container, Payment, etc.)
    │   │   ├── services/       # Couche métier pure (enrichissement, calculs CBM/frais)
    │   │   ├── routes/         # Routage Express avec injection des contrôleurs
    │   │   ├── middleware/     # Authentification JWT, sanitization, rate-limiter
    │   │   └── utils/          # Générateurs de codes MNC, PIN, reçus, WhatsApp URLs
    │   ├── prisma/
    │   │   ├── schema.prisma   # Schéma relationnel PostgreSQL indexé
    │   │   └── seed.js         # Données d'initialisation démo
    │   ├── test_secu.js        # Suite d'audit sécurité (50 tests automatisés)
    │   └── docker-entrypoint.sh# Script d'initialisation conteneur (db push auto)
    │
    └── frontend/
        ├── src/
        │   ├── components/     # Navbar, Footer, Hero, CbmSimulator, SocialProof
        │   │   └── admin/      # Tabs (Shipments, Containers, Cash, Settings) & Modales
        │   ├── pages/          # PlanDuSite, Confidentialite, MentionsLegales, SupportClient
        │   ├── services/       # Client API fetch, générateur PDF
        │   └── utils/          # Coordonnées officielles dynamiques & WhatsApp helpers
        └── vite.config.js
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Node.js** v20 ou supérieur
- **PostgreSQL** opérationnel localement ou distant (ex: Neon, Supabase, Render)

### 2. Cloner et Installer
```bash
git clone https://github.com/votre-compte/miname_cargo.git
cd miname_cargo

# Installer les dépendances backend et frontend
cd minane_app/backend && npm install
cd ../frontend && npm install
cd ../..
```

### 3. Configurer l'environnement
Copiez le fichier d'exemple dans `minane_app/backend/.env` :
```bash
cp minane_app/backend/.env.example minane_app/backend/.env
```
Renseignez votre `DATABASE_URL` et générez une clé secrète JWT :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Synchroniser la base de données et amorcer les données
```bash
npm run db:push
npm run db:seed
```

### 5. Lancer l'application
Depuis la racine du projet :
```bash
# Terminal 1 : Backend API (port 5050)
npm run dev:backend

# Terminal 2 : Frontend Vite (port 5173 ou 3000)
npm run dev:frontend
```

---

## 🔑 Identifiants de Test

### Espace Administrateur (Direction & Caisse)
- **URL :** Cliquez sur le bouclier 🛡️ en bas ou haut de page
- **Email :** `admin@minanecargo.sn`
- **Mot de passe :** `AdminMinane2026!`

### Colis de Test pour le Suivi Public
Entrez l'un de ces codes dans la barre de suivi :
- `MNC-8492A` — Statut : **En cours d'acheminement maritime**
- `MNC-1049B` — Statut : **Arrivé à Dakar (Prêt pour retrait avec PIN)**
- `MNC-7723C` — Statut : **Livré / Retiré au guichet**
- `MNC-9914D` — Statut : **Réceptionné en entrepôt Guangzhou**

---

## 🔒 Sécurité & Conformité

Le projet intègre une politique de sécurité défensive validée par **50 tests automatisés** :

```bash
npm test
```

### Protections Actives
1. **Injection SQL** : Requêtes 100% paramétrées via Prisma ORM + filtre préventif `sqlInjectionGuard`.
2. **Cross-Site Scripting (XSS)** : Nettoyage récursif des payloads (`globalSanitizer`) supprimant les balises HTML, handlers `onclick` et protocoles `javascript:`.
3. **Prototype Pollution** : Blocage systématique de `__proto__`, `constructor` et `prototype` dans toutes les requêtes JSON.
4. **Brute Force Protection** : Blocage après 5 tentatives infructueuses sur 15 minutes sur l'authentification admin (`authRateLimiter`).
5. **Authentification Durcie** : JWT signé avec l'algorithme `HS256` forcé, secret cryptographique de 128 caractères, timing-attack protection avec dummy bcrypt hash.
6. **Headers de Sécurité** : CSP stricte, `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`.
7. **Frontend Error Boundary** : Interception des erreurs de rendu React sans écran blanc, avec fallback corporate et redirection WhatsApp.

---

## 📡 Répertoire des Endpoints API

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | État de santé de l'API et horodatage |
| `GET` | `/api/settings` | Public | Paramètres globaux (taux CBM, dates de départ, contacts) |
| `PUT` | `/api/settings` | Admin | Mise à jour des taux, bannières et coordonnées |
| `POST` | `/api/auth/login` | Public | Authentification administrateur (Rate limited) |
| `GET` | `/api/auth/me` | Admin | Vérification de la session active |
| `GET` | `/api/tracking/:code` | Public | Suivi public d'un colis via son code MNC |
| `GET` | `/api/shipments` | Admin | Liste de tous les colis avec filtres |
| `POST` | `/api/shipments` | Admin | Création d'une nouvelle expédition (Guangzhou) |
| `PUT` | `/api/shipments/:id/status` | Admin | Évolution du statut (avec log d'historique) |
| `POST` | `/api/payments` | Admin | Enregistrement d'un règlement (Wave, OM, Cash) |
| `GET` | `/api/containers` | Admin | Gestion des conteneurs maritimes et dépenses |

---

## 🐳 Déploiement Docker & Render

L'ensemble de l'application est compilé et servi dans **un conteneur Docker unique** :
- Le frontend React est compilé en assets statiques.
- Express sert le frontend et les routes `/api/*` sur le même port.
- `docker-entrypoint.sh` synchronise automatiquement la base PostgreSQL au démarrage.

Consultez le guide détaillé : **[DEPLOY_RENDER.md](DEPLOY_RENDER.md)**.

---

## 📚 Documentation Complémentaire
- **[ARCHITECTURE.md](ARCHITECTURE.md)** : Conception logicielle, flux métier et schéma de base de données.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** : Bonnes pratiques et standards de code pour les développeurs.
- **[DEPLOY_RENDER.md](DEPLOY_RENDER.md)** : Guide de déploiement cloud pas-à-pas sur Render.

