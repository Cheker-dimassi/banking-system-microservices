# Architecture du Service Bancaire

## 🏗️ Architecture en 3 couches

### Flux de requête

```
HTTP Request
    ↓
[ROUTES] (compteRoutes.ts, mouvementRoutes.ts)
    ↓
[CONTROLLERS] (compteController.ts, mouvementController.ts)
    ↓
[SERVICES] (compteService.ts, mouvementService.ts)
    ↓
[MODELS] (CompteBancaire.ts, MouvementCompte.ts)
    ↓
[MONGODB]
```

### Détail des couches

#### 1. **Routes** 📍
Définition des endpoints REST
- `src/routes/compteRoutes.ts` - Routes des comptes
- `src/routes/mouvementRoutes.ts` - Routes des mouvements

```typescript
router.post('/', compteController.createCompte);
router.get('/', compteController.getAllComptes);
```

#### 2. **Controllers** 🎮
Gestion des requêtes/réponses HTTP
- Validation des inputs (via Zod)
- Appel des services
- Formatage des réponses
- Gestion des codes HTTP

```typescript
async createCompte(req: Request, res: Response) {
  const data = CreateCompteSchema.parse(req.body);
  const compte = await compteService.createCompte(data);
  res.status(201).json({ success: true, data: compte });
}
```

#### 3. **Services** 🔧
Logique métier
- Opérations CRUD
- Validation métier
- Interactions multi-modèles

```typescript
async createCompte(data: CreateCompteInput): Promise<ICompteBancaire> {
  const numeroCompte = this.generateNumeroCompte();
  const nouveau = new CompteBancaire({ ...data, numeroCompte });
  return await nouveau.save();
}
```

#### 4. **Models** 📊
Schémas Mongoose
- Définition des structures
- Validations au niveau BD
- Middlewares Mongoose

```typescript
const compteBancaireSchema = new Schema<ICompteBancaire>({
  numeroCompte: { type: String, required: true, unique: true },
  solde: { type: Number, required: true, default: 0 },
  // ...
});
```

---

## 🔐 Middlewares

### 1. **validation.ts** ✅
Schémas de validation Zod
- `CreateCompteSchema` - Création de compte
- `UpdateCompteSchema` - Mise à jour
- `CreateMouvementSchema` - Création mouvement
- `PaginationSchema` - Pagination

### 2. **errorHandler.ts** ❌
Gestion d'erreurs
- `AppError` - Classe d'erreur personnalisée
- `asyncHandler` - Wrapper pour les async/await
- `errorHandler` - Middleware global
- `notFoundHandler` - Gestion 404

---

## 📦 Types et Interfaces

**src/types/index.ts**

```typescript
// Interfaces principales
interface ICompteBancaire { ... }
interface IMouvementCompte { ... }

// Interfaces de pagination
interface PaginationOptions { ... }
interface PaginatedResponse<T> { ... }
```

---

## 🔄 Flux des opérations

### Créer un compte

```
POST /api/comptes
├── Validation du body (Zod)
├── Génération du numéro de compte
├── Création du document MongoDB
└── Réponse 201 avec les données
```

### Effectuer une transaction

```
POST /api/mouvements
├── Validation du body
├── Vérification du compte (services)
├── Calcul du nouveau solde
├── Vérification des limites (compte courant)
├── Création du mouvement
├── Mise à jour du solde du compte
└── Réponse 201 avec transaction
```

### Récupérer des données paginées

```
GET /api/comptes?page=1&limit=10
├── Validation des paramètres
├── Calcul du skip ((page-1) * limit)
├── Requête parallèle (données + total)
├── Calcul du nombre de pages
└── Réponse avec pagination
```

---

## 🛡️ Sécurité

### Middleware de sécurité
- **Helmet** - Protection HTTP headers
- **CORS** - Contrôle d'accès
- **Zod** - Validation stricte des inputs

### Bonnes pratiques
- Typage fort avec TypeScript
- Gestion d'erreurs globale
- Validation à tous les niveaux
- Pas d'exposition de données sensibles

---

## 📋 Entités

### CompteBancaire
```typescript
{
  _id: UUID,                    // Auto-généré
  numeroCompte: String,         // Unique, format IBAN
  typeCompte: 'COURANT' | 'EPARGNE',
  solde: Number,                // Solde actuel
  devise: String,               // Par défaut EUR
  dateCreation: Date,
  dateModification: Date,       // Mise à jour auto
  clientId: String,             // Référence client externe
  estActif: Boolean             // Soft delete
}
```

### MouvementCompte
```typescript
{
  _id: UUID,                    // Auto-généré
  compteId: String,             // Référence compte
  typeMouvement: 'CREDIT' | 'DEBIT',
  montant: Number,              // > 0
  soldeApresMouvement: Number,  // Trace l'historique
  dateMouvement: Date,          // Auto
  description: String,
  referenceTransaction: String  // Optionnel, unique
}
```

---

## 🔍 Opérations principales

### Comptes
- ✅ CRUD complet
- ✅ Pagination
- ✅ Filtrage par client
- ✅ Soft delete
- ✅ Numéro auto-généré

### Mouvements
- ✅ Création de transactions
- ✅ Historique complet
- ✅ Contrôle de solde
- ✅ Filtrage par compte/référence
- ✅ Solde trace automatique

---

## 🚀 Performances

### Optimisations
- **Indices MongoDB** - Sur `numeroCompte`, `clientId`, `compteId`
- **Opérations parallèles** - `Promise.all()` pour requêtes
- **Pagination** - Limitation des résultats
- **Lazy loading** - Données à la demande

### Limitations
- Max 100 résultats par page
- Index pour les recherches fréquentes
- Transactions atomiques préservées

---

## 🔗 Dépendances principales

| Paquet | Rôle |
|--------|------|
| `express` | Framework HTTP |
| `mongoose` | ORM MongoDB |
| `typescript` | Typage statique |
| `zod` | Validation schémas |
| `helmet` | Sécurité HTTP |
| `cors` | CORS middleware |
| `uuid` | ID uniques |
| `dotenv` | Variables d'env |

---

## 🌐 Variables d'environnement

```env
PORT=3000                                    # Port serveur
MONGODB_URI=mongodb://localhost:27017/db    # URI MongoDB
NODE_ENV=development                         # Environnement
CORS_ORIGIN=http://localhost:3000           # Origines CORS
LOG_LEVEL=debug                              # Niveau de log
```

---

## 📊 Diagramme d'interactions

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT / POSTMAN                 │
└────────────────────────┬────────────────────────────┘
                         │
                    HTTP/JSON
                         │
         ┌───────────────▼───────────────┐
         │     EXPRESS APP (port 3000)   │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │  HELMET (Sécurité)            │
         │  CORS (Contrôle accès)        │
         │  Body Parser (JSON)           │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │         ROUTES                │
         │  /api/comptes                 │
         │  /api/mouvements              │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │       CONTROLLERS             │
         │  - Validation Zod             │
         │  - Appel services             │
         │  - Formatage réponse          │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │        SERVICES               │
         │  - Logique métier             │
         │  - Règles de gestion          │
         │  - Transactions               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │  MONGOOSE MODELS              │
         │  - CompteBancaire             │
         │  - MouvementCompte            │
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │ MONGODB (Base de données)     │
         │  servicebank.comptes          │
         │  servicebank.mouvements       │
         └───────────────────────────────┘
```

---

## ✅ Checklist de couverture

- [x] CRUD Comptes bancaires
- [x] CRUD Mouvements
- [x] Validation des inputs
- [x] Gestion d'erreurs
- [x] Pagination
- [x] Génération numéro compte
- [x] Contrôle de solde
- [x] Soft delete
- [x] Historique complet
- [x] TypeScript strict
- [x] Middleware de sécurité
- [x] Tests (collection Postman)
