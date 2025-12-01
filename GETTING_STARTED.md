# Guide de Démarrage - Service Bancaire

## 📋 Prérequis

- **Node.js** v18+ 
- **MongoDB** v6.0+
- **npm** ou **yarn**

## 🚀 Démarrage rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration
Créer un fichier `.env` (copier depuis `.env.example`):
```bash
cp .env.example .env
```

Modifier les valeurs selon votre environnement:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/servicebank
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### 3. Démarrer MongoDB
```bash
# Avec Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0

# Ou installer MongoDB localement
# macOS: brew install mongodb-community
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Linux: https://docs.mongodb.com/manual/installation/
```

### 4. Démarrer le serveur

**Mode développement (avec hot reload):**
```bash
npm run dev:watch
```

**Mode développement simple:**
```bash
npm run dev
```

**Mode production:**
```bash
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 🐳 Avec Docker Compose

```bash
# Démarrer les services (MongoDB + API)
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter les services
docker-compose down

# Nettoyer (supprimer volumes)
docker-compose down -v
```

---

## 🧪 Tester l'API

### Health Check
```bash
curl http://localhost:3000/health
```

### Avec Postman
1. Importer le fichier `Postman_Collection.json`
2. Définir la variable `base_url` = `http://localhost:3000`
3. Tester les endpoints

### Avec cURL (Linux/macOS)
```bash
# Rendre exécutable
chmod +x test-requests.sh

# Lancer les tests
./test-requests.sh
```

---

## 📁 Structure du projet

```
src/
├── config/              # Configuration (BD, etc.)
│   └── database.ts
├── models/              # Modèles Mongoose
│   ├── CompteBancaire.ts
│   └── MouvementCompte.ts
├── controllers/         # Logique des requêtes
│   ├── compteController.ts
│   └── mouvementController.ts
├── services/            # Logique métier
│   ├── compteService.ts
│   └── mouvementService.ts
├── routes/              # Définition des routes
│   ├── compteRoutes.ts
│   └── mouvementRoutes.ts
├── middleware/          # Validation et gestion d'erreurs
│   ├── validation.ts
│   └── errorHandler.ts
├── types/               # Définitions TypeScript
│   └── index.ts
├── app.ts               # Configuration Express
└── index.ts             # Point d'entrée
```

---

## 📚 Documentation

- **API.md** - Documentation complète des endpoints
- **test-requests.sh** - Exemples de requêtes cURL
- **Postman_Collection.json** - Collection Postman

---

## 🔧 Commandes NPM

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm run build` | Compiler TypeScript |
| `npm run dev` | Démarrer en développement |
| `npm run dev:watch` | Démarrer avec hot reload |
| `npm start` | Démarrer production |
| `npm run lint` | Vérifier le linting |

---

## ❌ Dépannage

### MongoDB refuse la connexion
```bash
# Vérifier que MongoDB est démarré
# Linux/Mac:
ps aux | grep mongod

# Windows:
Get-Process mongod

# Vérifier l'URI
# mongodb://localhost:27017/servicebank
# ou mongodb://admin:password@localhost:27017/servicebank
```

### Port 3000 déjà utilisé
```bash
# Changer le port dans .env
PORT=3001
```

### Erreurs de compilation TypeScript
```bash
# Nettoyer et réinstaller
rm -rf dist node_modules
npm install
npm run build
```

---

## 📝 Notes importantes

1. **Génération de numéro de compte**: Automatique format IBAN `FR76...`
2. **Soft Delete**: Les comptes ne sont pas supprimés, juste désactivés (`estActif: false`)
3. **Validation**: Zod pour tous les inputs
4. **Sécurité**: Helmet middleware activé
5. **CORS**: Configurable via `.env`

---

## 🤝 Support

Pour les questions ou problèmes, consultez:
- La documentation API (API.md)
- Les logs de la console
- Les fichiers d'erreur TypeScript (npm run build)
