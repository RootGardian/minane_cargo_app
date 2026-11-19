# 🚀 Guide de Déploiement 1-Clic sur Render (Docker Tout-en-Un) — Minane Cargo

Ce projet est configuré avec un **Dockerfile multi-stage tout-en-un** qui embarque :
1. **Frontend React** (Vite + Tailwind CSS + jsPDF)
2. **Backend API Express** (Node.js + Prisma ORM + Sécurité)
3. **Base de données PostgreSQL embarquée** (avec initialisation et migration automatiques)

Le tout s'exécute dans **un seul et unique conteneur Docker** !

---

## 🌟 Avantages de l'Architecture Tout-en-Un
* **100% Gratuit sur Render** : Pas besoin de créer un service PostgreSQL Render externe (qui expire au bout de 30 jours sur le Free tier).
* **1 seul Web Service** : Facturation 0$ sans surprise.
* **0 problème de CORS** : Frontend et API partagent le même domaine HTTPS.
* **Initialisation automatique** : Dès le démarrage du conteneur, PostgreSQL se lance en local, crée la base `minane_db`, pousse le schéma Prisma (`db push`) et initialise les données de test (`seed`).
* **Flexibilité totale** : Si vous décidez plus tard de brancher une base de données externe (ex: Neon, Supabase, Render DB payante), il suffit de renseigner la variable `DATABASE_URL` et le conteneur l'utilisera automatiquement sans modification de code !

---

## 🛠️ Méthode 1 : Déploiement Automatique via Blueprint (`render.yaml`)

1. Connectez-vous sur votre compte [Render.com](https://dashboard.render.com).
2. Cliquez sur **New +** en haut à droite, puis sélectionnez **Blueprint**.
3. Liez votre dépôt GitHub `minane_cargo`.
4. Render va détecter automatiquement le fichier `render.yaml` :
   - Il crée le Web Service Docker `minane-cargo`.
   - Il configure les variables de production automatiquement.
5. Cliquez sur **Apply**.
6. En 3 à 5 minutes, votre conteneur est compilé et en ligne ! 🎉

---

## 🛠️ Méthode 2 : Déploiement Manuel sur Render (Web Service Docker)

1. Sur Render, cliquez sur **New +** > **Web Service**.
2. Liez votre dépôt GitHub.
3. Paramètres :
   - **Name** : `minane-cargo`
   - **Region** : `Frankfurt (EU Central)`
   - **Branch** : `main`
   - **Runtime** : `Docker`
   - **Dockerfile Path** : `./Dockerfile`
   - **Instance Type** : `Free`
4. Section **Environment Variables** :
   - `NODE_ENV` : `production`
   - `PORT` : `5000`
   - `JWT_SECRET` : Une chaîne aléatoire sécurisée de 32+ caractères (ex: `e5dcad11b5260cf9c868cf22d4d932a02561d8e4588c5c035c4a56593bf5b1d9`)
   - `ADMIN_EMAIL` : `admin@minanecargo.sn`
   - `ADMIN_PASSWORD` : `AdminMinane2026!`
   - `ADMIN_NAME` : `Gestionnaire Minane Cargo`
5. *(Optionnel - Persistance)* : Si vous disposez d'un plan Render Starter ou supérieur, vous pouvez ajouter un disque persistant de 1 Go monté sur `/var/lib/postgresql/data`.
6. Cliquez sur **Create Web Service**.

---

## 🔍 Vérification du bon fonctionnement
Une fois le déploiement terminé sur Render :
* **Page d'accueil :** `https://votre-app.onrender.com/` (Landing page avec simulateur CBM, suivi et réassurance).
* **Santé de l'API :** `https://votre-app.onrender.com/api/health` doit répondre `{"status": "OK"}`.
* **Espace Administrateur :** Cliquez sur le bouton Administrateur (icône cadenas) et connectez-vous avec :
  - **Email** : `admin@minanecargo.sn`
  - **Mot de passe** : `AdminMinane2026!`
