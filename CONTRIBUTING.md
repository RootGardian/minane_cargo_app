# 🤝 Guide de Contribution & Standards de Code — Minane Cargo

Bienvenue dans l'équipe de développement de **Minane Cargo**. Ce guide définit les conventions d'architecture, de code et de versioning à respecter pour maintenir un projet propre, maintenable et sécurisé.

---

## 1. Flux de Travail Git

### Nommage des Branches
- `feat/nom-fonctionnalite` : Nouvelle fonctionnalité (ex: `feat/notifications-sms`)
- `fix/description-bug` : Correction de bogue (ex: `fix/calcul-solde-paiement`)
- `refactor/composant` : Amélioration sans changement de comportement
- `docs/mise-a-jour` : Documentation

### Convention des Messages de Commit (Conventional Commits)
Chaque commit doit respecter le format :
```text
<type>(<scope optionnel>): <description au présent>

# Exemples :
feat(tracking): ajout du statut douane sénégalaise
fix(cbm): correction de l'arrondi sur les petits volumes
test(secu): ajout de tests d'injection d'en-tête
docs(api): documentation du endpoint de paiement
```

---

## 2. Standards de Code

### Backend (Node.js / Express / Prisma)
1. **Sécurité d'abord** : Toute nouvelle route acceptant des données en entrée (`POST`, `PUT`) doit valider les types et formats avant tout traitement via `VALIDATORS` (`src/middleware/sanitize.js`).
2. **Pas de requêtes SQL brutes** : Toujours utiliser les méthodes de l'instance Prisma (`prisma.shipment.findUnique()`). Ne jamais faire de concaténation de chaînes dans les requêtes.
3. **Gestion des Erreurs** :
   ```javascript
   try {
     // Logique métier
   } catch (error) {
     console.error('[NOM_MODULE]', error.message);
     res.status(500).json({ error: 'Message d\'erreur clair sans stacktrace sensible.' });
   }
   ```
4. **Dates en UTC** : Toutes les dates manipulées ou stockées en base de données doivent être en UTC (`DateTime` ISO 8601).

### Frontend (React 18 / Tailwind CSS)
1. **Composants Fonctionnels & Hooks** : Utiliser exclusivement des composants fonctionnels avec hooks React (`useState`, `useEffect`, `useMemo`).
2. **Design System & Couleurs Officielles** :
   * Bleu corporate Minane : `#042442`
   * Rouge d'accent : `#E2001A`
   * Fond de page secondaire : `#F8FAFC`
   * Bordures : `#E2E8F0`
3. **Gestion d'Erreur & Fallbacks** : Tout appel API doit être protégé par un bloc `.catch()` affichant un retour visuel à l'utilisateur.

---

## 3. Ajout d'une Migration de Base de Données

1. Modifier le fichier `minane_app/backend/prisma/schema.prisma`.
2. Pour tester en local :
   ```bash
   npm run db:push
   ```
3. Si de nouvelles colonnes critiques sont ajoutées, penser à ajouter un index `@@index([monChamp])` si ce champ fera l'objet de filtres fréquents.

---

## 4. Validation Avant Chaque Commit (Definition of Done)

Avant d'ouvrir une Pull Request ou de pousser sur `main` :

1. **Exécuter la suite de tests de sécurité :**
   ```bash
   npm test
   ```
   *Les 50 tests doivent impérativement être validés (100% verts).*

2. **Vérifier la compilation du frontend :**
   ```bash
   npm run build
   ```
   *Aucune erreur TypeScript/Vite ne doit être présente.*

3. **Vérifier que les variables d'environnement nécessaires sont documentées dans `.env.example`.**

