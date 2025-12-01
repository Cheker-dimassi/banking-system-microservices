# Exemples d'erreurs et cas limites

## Erreurs de validation

### 1. Compte non trouvé

**Requête:**
```http
GET /api/comptes/invalid-id-12345
```

**Réponse:** 404 Not Found
```json
{
  "success": false,
  "message": "Compte non trouvé",
  "statusCode": 404
}
```

### 2. Données invalides - Création compte

**Requête:**
```http
POST /api/comptes
Content-Type: application/json

{
  "typeCompte": "INVALID",
  "clientId": ""
}
```

**Réponse:** 400 Bad Request
```json
{
  "success": false,
  "message": "Erreur de validation",
  "details": [
    {
      "code": "invalid_enum_value",
      "expected": "'COURANT' | 'EPARGNE'",
      "received": "'INVALID'",
      "path": ["typeCompte"]
    },
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["clientId"]
    }
  ]
}
```

### 3. Montant négatif

**Requête:**
```http
POST /api/mouvements
Content-Type: application/json

{
  "compteId": "compte-id",
  "typeMouvement": "DEBIT",
  "montant": -50,
  "description": "Invalid"
}
```

**Réponse:** 400 Bad Request
```json
{
  "success": false,
  "message": "Montant invalide",
  "statusCode": 400
}
```

---

## Cas métier

### 1. Solde insuffisant (Compte COURANT)

**Situation:** Compte COURANT avec solde 100, tentative de retrait 150

**Requête:**
```http
POST /api/mouvements
Content-Type: application/json

{
  "compteId": "compte-courant-100",
  "typeMouvement": "DEBIT",
  "montant": 150,
  "description": "Retrait ATM"
}
```

**Réponse:** 400 Bad Request
```json
{
  "success": false,
  "message": "Solde insuffisant",
  "statusCode": 400
}
```

**Note:** Un compte d'EPARGNE refuserait aussi. Le débit n'est autorisé que si le solde résultant ≥ 0.

### 2. Retrait sur compte EPARGNE bloqué

Contrôle identique au compte COURANT:
```json
{
  "success": false,
  "message": "Solde insuffisant",
  "statusCode": 400
}
```

### 3. Crédit sans limite

Les crédits n'ont pas de limite - vous pouvez créditer n'importe quel montant.

---

## Cas de pagination

### 1. Page invalide

**Requête:**
```http
GET /api/comptes?page=0&limit=10
```

**Réponse:** 400 Bad Request
```json
{
  "success": false,
  "message": "Page invalide - minimum 1",
  "statusCode": 400
}
```

### 2. Limit dépassée

**Requête:**
```http
GET /api/comptes?page=1&limit=200
```

**Réponse:** 400 Bad Request
```json
{
  "success": false,
  "message": "Limit invalide - maximum 100",
  "statusCode": 400
}
```

### 3. Résultats vides

**Requête:**
```http
GET /api/comptes?page=999&limit=10
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 5,
    "page": 999,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Cas de conflit

### 1. Numéro de compte en double

Impossible - le système génère automatiquement des numéros uniques.

### 2. Client sans comptes

**Requête:**
```http
GET /api/comptes/client/unknown-client?page=1&limit=10
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

### 3. Compte désactivé (soft delete)

Les comptes désactivés n'apparaissent pas dans les listes:

```http
GET /api/comptes
```

Le compte supprimé (estActif: false) n'est pas retourné.

Mais vous pouvez y accéder directement si vous connaissez l'ID (optionnel selon implémentation).

---

## Erreurs serveur

### 1. MongoDB déconnecté

**Réponse:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Erreur serveur interne",
  "statusCode": 500
}
```

### 2. Route inexistante

**Requête:**
```http
GET /api/accounts/123
```

**Réponse:** 404 Not Found
```json
{
  "success": false,
  "message": "Route GET /api/accounts/123 non trouvée",
  "statusCode": 404
}
```

---

## Format de réponse standard

### Succès (2xx)
```json
{
  "success": true,
  "message": "Description optionnelle",
  "data": { /* objet ou array */ },
  "pagination": { /* optionnel */ }
}
```

### Erreur (4xx/5xx)
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "statusCode": 400,
  "error": "Détails en développement uniquement"
}
```

---

## Codes HTTP utilisés

| Code | Situation |
|------|-----------|
| 200 | Succès GET/PUT |
| 201 | Ressource créée POST |
| 400 | Validation échouée |
| 404 | Ressource inexistante |
| 500 | Erreur serveur |

---

## Conseils de test

### Ordre recommandé
1. ✅ Health check
2. ✅ Créer un compte
3. ✅ Récupérer le compte
4. ✅ Créer mouvements
5. ✅ Vérifier le solde mis à jour
6. ✅ Tester les erreurs

### Outils
- **Postman** - Collection fournie
- **cURL** - Script `test-requests.sh`
- **Insomnia** - Compatible Postman
- **Thunder Client** - Extension VS Code

### Variables à capturer
```bash
# Après création
COMPTE_ID=$(response.data._id)
MOUVEMENT_ID=$(response.data._id)
NUMERO_COMPTE=$(response.data.numeroCompte)
```

---

## Checklist de validation

- [ ] Les erreurs retournent le bon code HTTP
- [ ] Les messages d'erreur sont clairs
- [ ] La pagination fonctionne correctement
- [ ] Les validations Zod sont respectées
- [ ] Les contrôles de solde fonctionnent
- [ ] Les soft deletes ne retournent pas les comptes
- [ ] Les transactions sont bien tracées
- [ ] Les numéros de compte sont uniques
