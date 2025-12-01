# Documentation API - Service Bancaire

## Base URL
```
http://localhost:3000/api
```

## Health Check
```http
GET /health
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "message": "Service bancaire en ligne",
  "timestamp": "2024-11-26T12:00:00.000Z"
}
```

---

## 🏦 COMPTES BANCAIRES

### 1. Créer un compte
```http
POST /comptes
Content-Type: application/json

{
  "typeCompte": "COURANT",
  "clientId": "uuid-du-client",
  "solde": 1000,
  "devise": "EUR"
}
```

**Réponse:** 201 Created
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "_id": "uuid-compte",
    "numeroCompte": "FR7630001007941234567890185",
    "typeCompte": "COURANT",
    "solde": 1000,
    "devise": "EUR",
    "dateCreation": "2024-11-26T12:00:00.000Z",
    "dateModification": "2024-11-26T12:00:00.000Z",
    "clientId": "uuid-du-client",
    "estActif": true
  }
}
```

### 2. Récupérer tous les comptes
```http
GET /comptes?page=1&limit=10
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "uuid-compte",
      "numeroCompte": "FR7630001007941234567890185",
      "typeCompte": "COURANT",
      "solde": 1000,
      "devise": "EUR",
      "dateCreation": "2024-11-26T12:00:00.000Z",
      "dateModification": "2024-11-26T12:00:00.000Z",
      "clientId": "uuid-du-client",
      "estActif": true
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 3. Récupérer un compte par ID
```http
GET /comptes/{id}
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "uuid-compte",
    "numeroCompte": "FR7630001007941234567890185",
    "typeCompte": "COURANT",
    "solde": 1000,
    "devise": "EUR",
    "dateCreation": "2024-11-26T12:00:00.000Z",
    "dateModification": "2024-11-26T12:00:00.000Z",
    "clientId": "uuid-du-client",
    "estActif": true
  }
}
```

### 4. Récupérer les comptes d'un client
```http
GET /comptes/client/{clientId}?page=1&limit=10
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "uuid-compte",
      "numeroCompte": "FR7630001007941234567890185",
      "typeCompte": "COURANT",
      "solde": 1000,
      "devise": "EUR",
      "dateCreation": "2024-11-26T12:00:00.000Z",
      "dateModification": "2024-11-26T12:00:00.000Z",
      "clientId": "uuid-du-client",
      "estActif": true
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 5. Mettre à jour un compte
```http
PUT /comptes/{id}
Content-Type: application/json

{
  "typeCompte": "EPARGNE",
  "solde": 1500,
  "estActif": true
}
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "message": "Compte mis à jour avec succès",
  "data": {
    "_id": "uuid-compte",
    "numeroCompte": "FR7630001007941234567890185",
    "typeCompte": "EPARGNE",
    "solde": 1500,
    "devise": "EUR",
    "dateCreation": "2024-11-26T12:00:00.000Z",
    "dateModification": "2024-11-26T12:00:10.000Z",
    "clientId": "uuid-du-client",
    "estActif": true
  }
}
```

### 6. Supprimer (Soft Delete) un compte
```http
DELETE /comptes/{id}
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "message": "Compte désactivé avec succès"
}
```

---

## 💳 MOUVEMENTS COMPTE

### 1. Créer un mouvement (Débit/Crédit)
```http
POST /mouvements
Content-Type: application/json

{
  "compteId": "uuid-compte",
  "typeMouvement": "DEBIT",
  "montant": 50,
  "description": "Retrait ATM",
  "referenceTransaction": "REF-12345"
}
```

**Réponse:** 201 Created
```json
{
  "success": true,
  "message": "Mouvement enregistré avec succès",
  "data": {
    "_id": "uuid-mouvement",
    "compteId": "uuid-compte",
    "typeMouvement": "DEBIT",
    "montant": 50,
    "soldeApresMouvement": 950,
    "dateMouvement": "2024-11-26T12:05:00.000Z",
    "description": "Retrait ATM",
    "referenceTransaction": "REF-12345"
  }
}
```

**Cas d'erreur - Solde insuffisant (Compte COURANT):**
```json
{
  "success": false,
  "message": "Solde insuffisant",
  "statusCode": 400
}
```

### 2. Récupérer tous les mouvements
```http
GET /mouvements?page=1&limit=10
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "uuid-mouvement",
      "compteId": "uuid-compte",
      "typeMouvement": "DEBIT",
      "montant": 50,
      "soldeApresMouvement": 950,
      "dateMouvement": "2024-11-26T12:05:00.000Z",
      "description": "Retrait ATM",
      "referenceTransaction": "REF-12345"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### 3. Récupérer un mouvement par ID
```http
GET /mouvements/{id}
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "uuid-mouvement",
    "compteId": "uuid-compte",
    "typeMouvement": "DEBIT",
    "montant": 50,
    "soldeApresMouvement": 950,
    "dateMouvement": "2024-11-26T12:05:00.000Z",
    "description": "Retrait ATM",
    "referenceTransaction": "REF-12345"
  }
}
```

### 4. Récupérer les mouvements d'un compte
```http
GET /mouvements/compte/{compteId}?page=1&limit=10
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "uuid-mouvement",
      "compteId": "uuid-compte",
      "typeMouvement": "DEBIT",
      "montant": 50,
      "soldeApresMouvement": 950,
      "dateMouvement": "2024-11-26T12:05:00.000Z",
      "description": "Retrait ATM",
      "referenceTransaction": "REF-12345"
    },
    {
      "_id": "uuid-mouvement-2",
      "compteId": "uuid-compte",
      "typeMouvement": "CREDIT",
      "montant": 100,
      "soldeApresMouvement": 1050,
      "dateMouvement": "2024-11-26T13:00:00.000Z",
      "description": "Dépôt salaire",
      "referenceTransaction": "REF-12346"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 5. Récupérer les mouvements par référence de transaction
```http
GET /mouvements/transaction/{reference}
```

**Réponse:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "uuid-mouvement",
      "compteId": "uuid-compte",
      "typeMouvement": "DEBIT",
      "montant": 50,
      "soldeApresMouvement": 950,
      "dateMouvement": "2024-11-26T12:05:00.000Z",
      "description": "Retrait ATM",
      "referenceTransaction": "REF-12345"
    }
  ],
  "count": 1
}
```

---

## 📋 Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 400 | Bad Request | Données invalides |
| 404 | Not Found | Ressource introuvable |
| 500 | Server Error | Erreur serveur |

---

## 🔒 Paramètres de pagination

Tous les endpoints `GET` avec pagination supportent:

- `page`: Numéro de page (défaut: 1, min: 1)
- `limit`: Nombre d'éléments par page (défaut: 10, max: 100)

**Exemple:**
```http
GET /comptes?page=2&limit=20
```
