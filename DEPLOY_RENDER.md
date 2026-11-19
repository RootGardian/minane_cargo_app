# 🚀 Guide de Déploiement 1-Clic sur Render (Docker) — Minane Cargo

Ce projet est configuré avec un **Dockerfile multi-stage unifié** qui compile le Frontend React (Vite) et démarre le Backend Express (Node.js + Prisma) dans **un seul conteneur Docker**.

---

## 🌟 Avantages
* **1 seul Web Service Render** (gratuit ou 7$/mois, pas besoin de payer 2 instances).
* **0 problème de CORS** : Frontend et API partagent le même domaine HTTPS.
* **Synchronisation automatique de la base de données** au démarrage (`prisma db push` automatique).
* **Déploiement en 1 git push** sur GitHub.

---

## 🛠️ Méthode 1 : Déploiement Automatique via Blueprint (`render.yaml`)

1. Connectez-vous sur votre compte [Render.com](https://dashboard.render.com).
2. Cliquez sur **New +** en haut à droite, puis sélectionnez **Blueprint**.
3. Liez votre dépôt GitHub `miname_cargo`.
4. Render va détecter automatiquement le fichier `render.yaml` :
   - Il crée la base de données PostgreSQL `minane-cargo-db`.
   - Il crée le Web Service Docker `minane-cargo-app`.
   - Il relie automatiquement `DATABASE_URL` et génère un `JWT_SECRET` sécurisé.
5. Cliquez sur **Apply**.
6. En 3 à 5 minutes, votre application est en ligne ! 🎉

---

## 🛠️ Méthode 2 : Déploiement Manuel sur Render

Si vous préférez créer les services manuellement depuis l'interface Render :

### Étape 1 : Créer la Base de Données PostgreSQL
1. Sur Render, cliquez sur **New +** > **PostgreSQL**.
2. Nom : `minane-db`
3. Database : `minane_db`
4. User : `minane_user`
5. Plan : **Free**
6. Cliquez sur **Create Database**.
7. Une fois créée, copiez la valeur **Internal Database URL** (commence par `postgres://...`).

### Étape 2 : Créer le Web Service Docker
1. Cliquez sur **New +** > **Web Service**.
2. Liez votre dépôt GitHub `miname_cargo`.
3. Configuration :
   - **Name** : `minane-cargo`
   - **Language** : `Docker`
   - **Dockerfile Path** : `./Dockerfile`
   - **Plan** : `Free`
4. Section **Environment Variables** (cliquez sur "Add Environment Variable") :
   - `DATABASE_URL` : Collez l'URL PostgreSQL obtenue à l'étape 1.
   - `JWT_SECRET` : Une chaîne aléatoire d'au moins 32 caractères (ex: `e5dcad11b5260cf9c868cf22d4d932a02561d8e4588c5c035c4a56593bf5b1d9`).
   - `NODE_ENV` : `production`
   - `ADMIN_EMAIL` : `admin@minanecargo.sn`
   - `ADMIN_PASSWORD` : `AdminMinane2026!`
   - `ADMIN_NAME` : `Gestionnaire Minane Cargo`
5. Cliquez sur **Create Web Service**.

---

## 🔍 Vérification du bon fonctionnement
Une fois le déploiement terminé sur Render :
* **Page d'accueil :** `https://votre-app.onrender.com/` (Landing page avec simulateur CBM, suivi et réassurance).
* **Santé de l'API :** `https://votre-app.onrender.com/api/health` doit répondre `{"status": "OK"}`.
* **Espace Administrateur :** Cliquez sur le bouclier 🛡️ ou rendez-vous sur la plateforme et connectez-vous avec 

