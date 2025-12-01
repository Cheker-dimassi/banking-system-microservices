# 🚀 Quick Reference - Service Bancaire

## ⚡ Démarrage en 5 minutes

### 1. Cloner et installer
```bash
cd ~/Desktop/SERVICEBANK
npm install
```

### 2. Configuration MongoDB
```bash
# Avec Docker (recommandé)
docker run -d -p 27017:27017 mongo:7.0

# Ou localement
mongod
```

### 3. Démarrer le serveur
```bash
npm run dev:watch
# Serveur accessible: http://localhost:3000
```

### 4. Tester
```bash
curl http://localhost:3000/health
```

---

## 📌 Endpoints essentiels

### Comptes
```bash
# Créer
curl -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{"typeCompte":"COURANT","clientId":"cli-001","solde":1000}'

# Lister
curl http://localhost:3000/api/comptes

# Obtenir
curl http://localhost:3000/api/comptes/{id}

# Mettre à jour
curl -X PUT http://localhost:3000/api/comptes/{id} \
  -d '{"typeCompte":"EPARGNE"}'

# Supprimer (soft)
curl -X DELETE http://localhost:3000/api/comptes/{id}
```

### Mouvements
```bash
# Créer transaction
curl -X POST http://localhost:3000/api/mouvements \
  -d '{"compteId":"{id}","typeMouvement":"DEBIT","montant":100,"description":"Retrait"}'

# Lister
curl http://localhost:3000/api/mouvements

# Historique compte
curl http://localhost:3000/api/mouvements/compte/{compteId}
```

---

## 🔧 Commandes importantes

| Commande | Action |
|----------|--------|
| `npm install` | Installer dépendances |
| `npm run build` | Compiler TypeScript |
| `npm run dev` | Mode développement |
| `npm run dev:watch` | Dev avec auto-reload |
| `npm start` | Production |
| `npm run lint` | Vérifier linting |

---

## 📁 Structure clé

```
src/
├── models/           # Schémas MongoDB
├── services/         # Logique métier
├── controllers/      # Endpoints HTTP
├── routes/           # Définition routes
├── middleware/       # Validation & erreurs
└── config/           # Configuration BD
```

---

## 🐳 Docker

### Démarrer tout
```bash
docker-compose up -d
```

### Logs
```bash
docker-compose logs -f
```

### Arrêter
```bash
docker-compose down
```

---

## 🔑 Variables d'environnement

```env
PORT=3000                                    # Port API
MONGODB_URI=mongodb://localhost:27017/db    # BD
NODE_ENV=development                         # Mode
CORS_ORIGIN=http://localhost:3000           # CORS
```

---

## ✅ Checklist avant production

- [ ] `.env` configuré
- [ ] MongoDB accessible
- [ ] `npm run build` OK
- [ ] Collection Postman testée
- [ ] Variables d'env sécurisées
- [ ] Logs activés
- [ ] CORS configuré

---

## 🐛 Dépannage rapide

### Port déjà utilisé
```bash
# Changer dans .env
PORT=3001
```

### MongoDB en erreur
```bash
# Vérifier l'URI
mongodb://[user:password@]host:port/database
```

### TypeScript ne compile pas
```bash
# Nettoyer et réinstaller
rm -rf dist node_modules
npm install && npm run build
```

---

## 📚 Fichiers à lire

1. **README.md** - Vue d'ensemble
2. **GETTING_STARTED.md** - Installation
3. **API.md** - Endpoints
4. **ARCHITECTURE.md** - Design
5. **ERRORS.md** - Erreurs

---

## 🔐 Points de sécurité

✅ Helmet - Headers HTTP
✅ CORS - Contrôle origines
✅ Zod - Validation stricte
✅ TypeScript - Typage
✅ Soft delete - Conservation données

---

## 📊 Cas de test rapides

### Test 1: Créer compte et mouvement
```bash
# 1. Créer compte
COMPTE=$(curl -s -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{"typeCompte":"COURANT","clientId":"test","solde":1000}' | jq -r '.data._id')

# 2. Effectuer transaction
curl -X POST http://localhost:3000/api/mouvements \
  -H "Content-Type: application/json" \
  -d '{"compteId":"'$COMPTE'","typeMouvement":"DEBIT","montant":100,"description":"Test"}'

# 3. Vérifier solde
curl http://localhost:3000/api/comptes/$COMPTE | jq '.data.solde'
```

---

## 🎯 Points clés à retenir

1. **3 couches:** Routes → Controllers → Services → Models
2. **Validation:** Tous les inputs sont validés avec Zod
3. **Pagination:** Max 100 éléments par page
4. **Soft delete:** Les comptes ne sont jamais supprimés
5. **Transactions:** Chaque mouvement trace le solde
6. **Sécurité:** Helmet + CORS + TypeScript

---

## 🚀 Pour mise en production

```bash
# 1. Compiler
npm run build

# 2. Démarrer
NODE_ENV=production npm start

# 3. Ou avec Docker
docker build -t servicebank .
docker run -p 3000:3000 servicebank
```

---

## 📞 Ressources

- **API Doc:** `API.md`
- **Architecture:** `ARCHITECTURE.md`
- **Postman:** `Postman_Collection.json`
- **Tests cURL:** `test-requests.sh`

---

**Dernière mise à jour:** 26 novembre 2024
**Statut:** ✅ Production-ready
