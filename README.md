# Tany & Toerana — Plateforme de gestion de loyer, vente de terrain

Application web de **recherche, location et vente immobilière** à Madagascar : appartements, maisons/villas et terrains, avec recherche par budget, candidatures en ligne, contrats de bail numérisés, signature électronique et paiement Mobile Money (Mvola, Orange Money, Airtel Money).

**Stack** : React (frontend) · Laravel API (backend) · MySQL (base de données)

---

## 1. Installation

### Prérequis
- PHP ≥ 8.2 + Composer
- MySQL / MariaDB
- Node.js ≥ 18
- (Optionnel) clé API Pexels pour les photos des annonces de démo

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env          # puis configurez DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate
php artisan db:seed           # admin + données de démonstration complètes
php artisan serve             # → http://localhost:8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

La landing page s'affiche en premier : cliquez sur **Connexion / Inscription** en haut à droite.

---

## 2. Comptes de démonstration

Tous les mots de passe sont `password` (sauf admin : `admin123`).

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@tanytoerana.mg` | `admin123` |
| **Propriétaire 1** | `proprio1@tanytoerana.mg` | `password` |
| **Propriétaire 2** | `proprio2@tanytoerana.mg` | `password` |
| **Propriétaire 3** | `proprio3@tanytoerana.mg` | `password` |
| **Locataire 1** | `loc1@tanytoerana.mg` | `password` |
| **Locataire 2** | `loc2@tanytoerana.mg` | `password` |
| **Locataire 3** | `loc3@tanytoerana.mg` | `password` |

> `php artisan db:seed` est **idempotent** : il peut être relancé sans créer de doublons.

---

## 3. Guide d'utilisation

### 3.1 Visiteur (sans compte)
- **Landing page** (`/`) : barre de recherche par budget, annonces récentes, présentation des services.
- **Rechercher un bien** (`/recherche`) : filtres budget min/max, type de bien, ville, mode (location/vente), carte des résultats.
- **Détail d'une annonce** (`/annonces/:id`) : galerie photos, caractéristiques, localisation.
- Pour candidater ou contacter un propriétaire → **Inscription** (choix du rôle locataire ou propriétaire).

### 3.2 Locataire
1. **S'inscrire** en tant que locataire (rôle présélectionné via `/register?role=locataire`).
2. **Rechercher** des biens selon le budget → mettre en **favoris** ❤️, créer des **alertes** (`Mes alertes`).
3. **Candidater** sur une annonce : envoyer message + documents (CIN, justificatifs) via `Mes candidatures`.
4. Une fois accepté : **contrat de bail** généré, **signature électronique** (`Mes contrats`).
5. **Payer le loyer** chaque mois par Mvola / Orange / Airtel Money (`Mes paiements`), recevoir les reçus.
6. **Discuter** avec le propriétaire via la messagerie, suivre les notifications (cloche en haut).
7. Fin de bail : **avis** mutuel, remboursement de caution.

### 3.3 Propriétaire
1. **S'inscrire** en tant que propriétaire (compte vérifié en démo).
2. **Ajouter un bien** (`Ajouter une propriété`) : type, prix, photos, localisation GPS → visible dans la recherche une fois l'annonce créée.
3. **Mes propriétés** : tableau des annonces + statut.
4. Étudier les **candidatures** reçues, accepter/refuser.
5. Générer le **contrat**, suivre les **paiements** et impayés (`Mes paiements`), gérer les **litiges** (`Mes litiges`).
6. Tableau de bord : occupation, revenus mensuels.

### 3.4 Administrateur
- **Validation & modération** (`/admin/validations`) : vérifier les annonces.
- **Statistiques globales** (`/admin/statistiques`) : utilisateurs, biens, revenus, activités.

### 3.5 Assistant intégré 🏠
Bouton en forme de maison (en bas à droite) : posez vos questions (budget, paiement, inscription…). Fonctionne partout, y compris sur la landing page.

---

## 4. Données de démonstration

Le seeder `DemoDataSeeder` peuple **toutes les tables** :

| Table | Contenu |
|---|---|
| `users` | 1 admin, 3 propriétaires, 3 locataires |
| `proprietes` / `maisons` / `appartements` / `terrains` | 10 biens (Tana, Toamasina, Antsirabe, Mahajanga) |
| `annonces` | synchronisées automatiquement (observer) |
| `localisations` / `images_proprietes` | adresse + GPS, 4 photos Pexels par bien |
| `candidatures` / `documents_locataires` | 5 candidatures + documents (cin, revenu) |
| `contrats_bail` / `locations` / `colocataires` | 2 contrats signés et actifs |
| `etats_des_lieux` | états d'entrée |
| `paiements_loyer` / `factures_electricite` | ~8 mois de paiements + factures JIRAMA |
| `messages` / `notifications` | échanges propriétaire ↔ locataire, notifications variées |
| `avis` / `favoris` / `alertes_recherche` / `litiges` / `historique_prix` | évaluations, favoris, alertes, litiges, évolution des prix |

---

## 5. Structure du projet

```
├── backend/                 → Laravel (API REST + Sanctum)
│   ├── app/Models/          → 24 modèles Eloquent
│   ├── app/Http/Controllers/Api/
│   ├── app/Services/        → PaiementMobileMoney, ContratPdf, Notification…
│   ├── database/migrations/ → 23 tables
│   └── database/seeders/    → DefaultAdminSeeder + DemoDataSeeder
└── frontend/                → React (Vite)
    ├── src/pages/           → Landing, Recherche, Dashboard, Admin…
    ├── src/components/      → common/, annonce/, candidature/, contrat/, paiement/, messagerie/, dashboard/
    ├── src/context/         → AuthContext, NotificationContext
    └── src/api/             → clients Axios par ressource
```

## 6. API (extraits)

| Méthode | Endpoint | Rôle |
|---|---|---|
| POST | `/api/register` · `/api/login` | Comptes |
| GET | `/api/annonces?budget_min=&budget_max=&type=&ville=` | Recherche unifiée |
| POST | `/api/annonces/{id}/candidatures` | Candidater |
| POST | `/api/contrats/{id}/signer` | Signature électronique |
| POST | `/api/paiements` | Paiement Mobile Money |
| GET | `/api/messages?with_user=` | Messagerie |
| GET/POST | `/api/alertes-recherche` | Alertes budget |
