# 📋 Données d'exemple pour tests

## 🏦 Comptes à tester

### Compte courant classique
```json
{
  "typeCompte": "COURANT",
  "clientId": "client-001",
  "solde": 5000,
  "devise": "EUR"
}
```

### Compte épargne
```json
{
  "typeCompte": "EPARGNE",
  "clientId": "client-001",
  "solde": 10000,
  "devise": "EUR"
}
```

### Compte avec solde bas
```json
{
  "typeCompte": "COURANT",
  "clientId": "client-002",
  "solde": 100,
  "devise": "EUR"
}
```

---

## 💳 Mouvements de test

### Débit simple (Retrait ATM)
```json
{
  "typeMouvement": "DEBIT",
  "montant": 50,
  "description": "Retrait ATM",
  "referenceTransaction": "ATM-2024-001"
}
```

### Crédit simple (Dépôt)
```json
{
  "typeMouvement": "CREDIT",
  "montant": 200,
  "description": "Dépôt espèces",
  "referenceTransaction": "DEP-2024-001"
}
```

### Salaire (crédit gros montant)
```json
{
  "typeMouvement": "CREDIT",
  "montant": 2500,
  "description": "Dépôt salaire mensuel",
  "referenceTransaction": "SAL-2024-11"
}
```

### Facture (débit)
```json
{
  "typeMouvement": "DEBIT",
  "montant": 120,
  "description": "Paiement électricité",
  "referenceTransaction": "FAC-EDF-2024"
}
```

### Transfert (débit)
```json
{
  "typeMouvement": "DEBIT",
  "montant": 500,
  "description": "Transfert vers IBAN XX",
  "referenceTransaction": "TRF-2024-11-001"
}
```

---

## 📊 Scénarios de test complets

### Scénario 1: Client avec multiple comptes
```bash
# Client avec 1 compte courant et 1 compte épargne
CLIENT_ID="client-premium-001"

# Compte 1 - Courant
curl -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{
    "typeCompte": "COURANT",
    "clientId": "'$CLIENT_ID'",
    "solde": 5000
  }'

# Compte 2 - Épargne
curl -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{
    "typeCompte": "EPARGNE",
    "clientId": "'$CLIENT_ID'",
    "solde": 25000
  }'

# Lister tous les comptes du client
curl http://localhost:3000/api/comptes/client/$CLIENT_ID
```

### Scénario 2: Cycle de vie complet
```bash
# 1. Créer un compte avec 1000
COMPTE=$(curl -s -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{"typeCompte":"COURANT","clientId":"test-user","solde":1000}' | jq -r '.data._id')

echo "Compte créé: $COMPTE"

# 2. Effectuer un débit de 250
MOUV1=$(curl -s -X POST http://localhost:3000/api/mouvements \
  -H "Content-Type: application/json" \
  -d '{"compteId":"'$COMPTE'","typeMouvement":"DEBIT","montant":250,"description":"Retrait"}' | jq -r '.data.soldeApresMouvement')

echo "Après retrait 250: $MOUV1" # Doit être 750

# 3. Effectuer un crédit de 500
MOUV2=$(curl -s -X POST http://localhost:3000/api/mouvements \
  -H "Content-Type: application/json" \
  -d '{"compteId":"'$COMPTE'","typeMouvement":"CREDIT","montant":500,"description":"Dépôt"}' | jq -r '.data.soldeApresMouvement')

echo "Après dépôt 500: $MOUV2" # Doit être 1250

# 4. Vérifier le solde final
FINAL=$(curl -s http://localhost:3000/api/comptes/$COMPTE | jq '.data.solde')
echo "Solde final: $FINAL" # Doit être 1250

# 5. Voir l'historique
curl -s http://localhost:3000/api/mouvements/compte/$COMPTE | jq '.data | length'
```

### Scénario 3: Test d'erreur (solde insuffisant)
```bash
# Créer compte avec peu de solde
COMPTE_FAIBLE=$(curl -s -X POST http://localhost:3000/api/comptes \
  -H "Content-Type: application/json" \
  -d '{"typeCompte":"COURANT","clientId":"test-pauvre","solde":50}' | jq -r '.data._id')

# Tentative de retrait > solde (doit échouer)
curl -X POST http://localhost:3000/api/mouvements \
  -H "Content-Type: application/json" \
  -d '{"compteId":"'$COMPTE_FAIBLE'","typeMouvement":"DEBIT","montant":100,"description":"Retrait"}'

# Réponse: 400 Solde insuffisant
```

---

## 🎲 Données aléatoires pour stress test

```bash
# Créer 10 comptes aléatoires
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/comptes \
    -H "Content-Type: application/json" \
    -d '{"typeCompte":"COURANT","clientId":"bulk-'$i'","solde":'$((RANDOM % 10000))'}'
done

# Créer 50 mouvements
for i in {1..50}; do
  TYPE=$((RANDOM % 2 == 0 ? "DEBIT" : "CREDIT"))
  curl -s -X POST http://localhost:3000/api/mouvements \
    -H "Content-Type: application/json" \
    -d '{"compteId":"COMPTE_ID","typeMouvement":"'$TYPE'","montant":'$((RANDOM % 1000))',"description":"Test '$i'"}'
done
```

---

## 🔍 Vérifications de données

### Vérifier un compte
```bash
curl http://localhost:3000/api/comptes/{COMPTE_ID} | jq '.'
```

### Voir l'historique complet
```bash
curl http://localhost:3000/api/mouvements/compte/{COMPTE_ID}?page=1&limit=50 | jq '.'
```

### Vérifier une transaction
```bash
curl http://localhost:3000/api/mouvements/transaction/{REFERENCE} | jq '.'
```

### Pagination
```bash
# Page 1
curl http://localhost:3000/api/comptes?page=1&limit=5

# Page 2
curl http://localhost:3000/api/comptes?page=2&limit=5
```

---

## 📈 Cas de charge

### Léger (débutant)
- 5 comptes
- 10 mouvements
- Pagination par 10

### Moyen (production test)
- 50 comptes
- 200 mouvements
- Pagination par 25

### Lourd (stress test)
- 500 comptes
- 5000 mouvements
- Pagination par 50

---

## 📝 Template générique

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

# Fonction pour créer un compte
create_compte() {
  local TYPE=$1
  local CLIENT=$2
  local SOLDE=$3
  
  curl -s -X POST $BASE_URL/comptes \
    -H "Content-Type: application/json" \
    -d '{
      "typeCompte": "'$TYPE'",
      "clientId": "'$CLIENT'",
      "solde": '$SOLDE'
    }'
}

# Fonction pour créer un mouvement
create_mouvement() {
  local COMPTE=$1
  local TYPE=$2
  local MONTANT=$3
  local DESC=$4
  
  curl -s -X POST $BASE_URL/mouvements \
    -H "Content-Type: application/json" \
    -d '{
      "compteId": "'$COMPTE'",
      "typeMouvement": "'$TYPE'",
      "montant": '$MONTANT',
      "description": "'$DESC'"
    }'
}

# Utilisation
COMPTE=$(create_compte "COURANT" "client-1" 1000 | jq -r '.data._id')
create_mouvement $COMPTE "DEBIT" 100 "Test"
```

---

## 🎯 Checklist de test

- [ ] Créer un compte
- [ ] Récupérer le compte
- [ ] Lister les comptes
- [ ] Mettre à jour un compte
- [ ] Créer un mouvement (débit)
- [ ] Créer un mouvement (crédit)
- [ ] Vérifier le solde mis à jour
- [ ] Tester pagination
- [ ] Tester erreur (solde insuffisant)
- [ ] Tester soft delete
- [ ] Vérifier historique
- [ ] Chercher par référence

---

**Conseil:** Gardez ces données de test à proximité pour développement rapide!
