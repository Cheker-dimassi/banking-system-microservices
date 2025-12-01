#!/bin/bash

# Service Bancaire - Exemples de requêtes cURL

BASE_URL="http://localhost:3000/api"

# ========================================
# HEALTH CHECK
# ========================================
echo "=== Health Check ==="
curl -X GET "$BASE_URL/../health" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# ========================================
# COMPTES - CREER UN COMPTE
# ========================================
echo "=== Créer un compte courant ==="
COMPTE_ID=$(curl -s -X POST "$BASE_URL/comptes" \
  -H "Content-Type: application/json" \
  -d '{
    "typeCompte": "COURANT",
    "clientId": "client-001",
    "solde": 1000,
    "devise": "EUR"
  }' | jq -r '.data._id')

echo "ID du compte créé: $COMPTE_ID"
echo -e "\n"

# ========================================
# COMPTES - RECUPERER UN COMPTE
# ========================================
echo "=== Récupérer le compte ==="
curl -s -X GET "$BASE_URL/comptes/$COMPTE_ID" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# COMPTES - LISTER TOUS LES COMPTES
# ========================================
echo "=== Lister tous les comptes ==="
curl -s -X GET "$BASE_URL/comptes?page=1&limit=10" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# COMPTES - COMPTES D'UN CLIENT
# ========================================
echo "=== Comptes du client 'client-001' ==="
curl -s -X GET "$BASE_URL/comptes/client/client-001?page=1&limit=10" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# MOUVEMENTS - CREER UN MOUVEMENT (DEBIT)
# ========================================
echo "=== Créer un mouvement - DÉBIT ==="
MOUVEMENT_ID=$(curl -s -X POST "$BASE_URL/mouvements" \
  -H "Content-Type: application/json" \
  -d '{
    "compteId": "'$COMPTE_ID'",
    "typeMouvement": "DEBIT",
    "montant": 100,
    "description": "Retrait ATM",
    "referenceTransaction": "TXN-001"
  }' | jq -r '.data._id')

echo "ID du mouvement: $MOUVEMENT_ID"
echo -e "\n"

# ========================================
# MOUVEMENTS - CREER UN MOUVEMENT (CREDIT)
# ========================================
echo "=== Créer un mouvement - CRÉDIT ==="
curl -s -X POST "$BASE_URL/mouvements" \
  -H "Content-Type: application/json" \
  -d '{
    "compteId": "'$COMPTE_ID'",
    "typeMouvement": "CREDIT",
    "montant": 500,
    "description": "Dépôt salaire",
    "referenceTransaction": "TXN-002"
  }' | jq '.'

echo -e "\n\n"

# ========================================
# MOUVEMENTS - RECUPERER UN MOUVEMENT
# ========================================
echo "=== Récupérer le mouvement ==="
curl -s -X GET "$BASE_URL/mouvements/$MOUVEMENT_ID" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# MOUVEMENTS - LISTER TOUS LES MOUVEMENTS
# ========================================
echo "=== Lister tous les mouvements ==="
curl -s -X GET "$BASE_URL/mouvements?page=1&limit=10" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# MOUVEMENTS - MOUVEMENTS D'UN COMPTE
# ========================================
echo "=== Mouvements du compte ==="
curl -s -X GET "$BASE_URL/mouvements/compte/$COMPTE_ID?page=1&limit=10" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# MOUVEMENTS - PAR REFERENCE
# ========================================
echo "=== Mouvements par référence TXN-001 ==="
curl -s -X GET "$BASE_URL/mouvements/transaction/TXN-001" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n\n"

# ========================================
# COMPTES - METTRE A JOUR UN COMPTE
# ========================================
echo "=== Mettre à jour le compte ==="
curl -s -X PUT "$BASE_URL/comptes/$COMPTE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "typeCompte": "EPARGNE",
    "estActif": true
  }' | jq '.'

echo -e "\n\n"

# ========================================
# COMPTES - SOFT DELETE
# ========================================
echo "=== Désactiver le compte ==="
curl -s -X DELETE "$BASE_URL/comptes/$COMPTE_ID" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"
