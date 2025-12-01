# Accounts Service

**Owner:** Aymen Somai  
**Port:** 3004  
**Technology:** TypeScript, Express, MongoDB, Mongoose

## 📋 Description

Service de gestion des comptes bancaires et des mouvements. Gère les opérations CRUD sur les comptes, l'historique des transactions, et l'export PDF des relevés.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development mode (with hot-reload)
npm run dev

# Production mode
npm run build
npm start
```

Service runs on **port 3004** by default.

## 📡 API Endpoints

### Comptes Bancaires

- `POST /api/comptes` - Créer un compte
- `GET /api/comptes` - Lister les comptes (pagination)
- `GET /api/comptes/:id` - Détail d'un compte
- `GET /api/comptes/client/:clientId` - Comptes d'un client
- `PUT /api/comptes/:id` - Mettre à jour un compte
- `DELETE /api/comptes/:id` - Soft delete

### Mouvements

- `POST /api/mouvements` - Créer une transaction
- `GET /api/mouvements` - Lister les mouvements (pagination)
- `GET /api/mouvements/:id` - Détail d'un mouvement
- `GET /api/mouvements/compte/:compteId` - Historique d'un compte
- `GET /api/mouvements/transaction/:reference` - Par référence

## 🔧 Configuration

Create `.env` file:

```env
PORT=3004
MONGODB_URI=mongodb://localhost:27017/servicebank
CORS_ORIGIN=http://localhost:3000
```

## 📚 Documentation Complète

Voir `README_FULL.md` pour la documentation complète avec exemples, architecture, et guides de test.

## 🏗️ Architecture

- **TypeScript** pour le typage statique
- **Express** pour le serveur HTTP
- **Mongoose** pour MongoDB
- **Zod** pour la validation
- **Helmet** pour la sécurité
- **PDFKit** pour l'export de relevés

## 📦 Structure

```
services/accounts-service/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── CompteBancaire.ts
│   │   └── MouvementCompte.ts
│   ├── controllers/
│   │   ├── compteController.ts
│   │   └── mouvementController.ts
│   ├── services/
│   │   ├── compteService.ts
│   │   └── mouvementService.ts
│   └── routes/
│       ├── compteRoutes.ts
│       └── mouvementRoutes.ts
├── package.json
└── tsconfig.json
```

## 🔗 Access via Gateway

- Accounts: `http://localhost:3000/api/comptes`
- Movements: `http://localhost:3000/api/mouvements`

## ✅ Status

✅ Production-ready  
✅ Fully documented  
✅ TypeScript strict mode  
✅ Error handling  
✅ PDF export functionality
