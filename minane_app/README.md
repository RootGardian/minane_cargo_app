# 🚢 Minane Cargo - Application Web Métier Full-Stack

Application web métier complète pour **Minane Cargo**, société de transit et de fret international opérant exclusivement sur le corridor **Chine (Guangzhou  ) → Sénégal (Port de Dakar / AIBD)**.

---

## 🛠️ Stack Technique & Architecture

- **Frontend :** React 18, Vite, Tailwind CSS, Lucide React Icons.
- **Backend :** Node.js, Express, Prisma ORM, PostgreSQL 18, JWT (`bcryptjs` + `jsonwebtoken`).
- **Génération PDF 100% Client-Side :** `jsPDF` + `jspdf-autotable`.
- **Politique Zero-Storage :**
  - Aucune image ou fichier PDF n'est stocké en base de données ou sur S3.
  - La base PostgreSQL locale ne stocke que des données hautement structurées.
  - Les factures et reçus de paiement sont générés dynamiquement à la volée côté navigateur React à partir des données JSON de l'API.
- **Périmètre Géographique :** Exclusivement Chine ➔ Sénégal. Devise unique : **FCFA (XOF)**.

---

---

## 🔑 Identifiants Démo


### 2. Espace Grossiste (Sandaga /  Dakar)
- **Grossiste 1 :** Moussa Diop (Sandaga Import)
  - Téléphone : `+221771234567`
  - Code PIN : `1234`
- **Grossiste 2 :** Fatou Ndiaye (HighTech  Dakar)
  - Téléphone : `+221782345678`
  - Code PIN : `5678`

### 3. Exemples de Codes de Suivi Publics
- `MNC-8492A` : Colis disponible au dépôt  Dakar avec solde restant (PIN : `4821`).
- `MNC-1049B` : Colis disponible au dépôt, 100% soldé (PIN : `9312`).
- `MNC-7723C` : Colis en mer vers Dakar (VIP Override).
- `MNC-9914D` : Colis Aérien Express livré.

---

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend Express (Port 5050)
```bash
cd backend
npm run dev
# ou
node src/index.js
```

### 2. Démarrer le Frontend React (Port 3000)
```bash
cd frontend
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

---

## 📦 Fonctionnalités Clés Implémentées

### 1. Landing Page Publique
- Barre de suivi instantané par code unique (`MNC-XXXX`) sans compte.
- Encart dynamique des prochains départs (Cut-off Chine, Chargement conteneur, Arrivée Dakar).
- Simulateur interactif CBM & Aérien calculant en direct le coût selon la grille active (`AppSettings`).
- Présentation détaillée des 4 offres de fret.

### 2. Espace Suivi & Grossiste
- Timeline visuelle en 8 étapes (`CHINA_WAREHOUSE` à `DELIVERED`).
- Situation financière détaillée (Total, Versements Wave/OM/Cash/Virement, Reste à payer).
- Affichage du **Code PIN de retrait OTP (4 chiffres)** uniquement lorsque le colis est disponible à Dakar.
- Bouton WhatsApp pré-rempli pour contacter le support.
- Téléchargement instantané de la Facture et des Reçus de paiement en PDF (100% côté navigateur).
- Dashboard consolidé grossiste : KPIs (Colis en Chine, en mer, à Dakar, **Dette globale cumulée**).

### 3. Back-Office Admin
- **Création de colis :** Code de suivi unique automatique (`MNC-XXXXXX`) et PIN aléatoire à 4 chiffres.
- **Calculateur tarifaire automatique avec Override VIP :** Calcul selon le volume CBM ou poids avec possibilité d'écraser le montant final pour les grands comptes.
- **Partage WhatsApp en 1 clic :** Lien `https://wa.me/[phone]?text=...` pré-rempli.
- **Gestion des Conteneurs & Bulk Update :** Changer le statut d'un conteneur met à jour automatiquement tous les colis associés et ajoute une entrée d'historique.
- **P&L Conteneur :** Saisie des dépenses (`SEA_FREIGHT`, `PORT_FEES`, `CUSTOMS`, `HANDLING`, etc.) et calcul du bénéfice net et de la marge en %.
- **Caisse & Créances :** Enregistrement des règlements avec génération d'un numéro de reçu unique (`REC-YYYY-XXXX`).
- **Validation Sécurisée de Retrait :** Refus strict du statut `DELIVERED` si le reste à payer est > 0 (sauf dérogation explicite) ou si le code PIN 4 chiffres est incorrect.
- **Paramètres Globaux (`AppSettings`) :** Modification en temps réel des tarifs et dates du prochain départ.

