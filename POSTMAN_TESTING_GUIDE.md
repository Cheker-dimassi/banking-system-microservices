# 🧪 COMPLETE DOCKER TESTING GUIDE - ALL WORKING LINKS

## ✅ ALL LINKS TESTED AND WORKING!

**Gateway:** http://localhost:3000
**All requests go through port 3000!**

---

## 1️⃣ HEALTH CHECKS

### Gateway Health
```
GET http://localhost:3000/health
```
**Expected:** `{"status":"ok","gateway":"running"}`

### Gateway Info
```
GET http://localhost:3000/
```
**Shows:** All services and available endpoints

---

## 2️⃣ ACCOUNTS API (COMPTES)

### Get All Accounts
```
GET http://localhost:3000/api/comptes
```

### Create New Account
```
POST http://localhost:3000/api/comptes
Content-Type: application/json

{
  "numeroCompte": "ACC_TEST_001",
  "solde": 10000,
  "devise": "TND",
  "typeCompte": "COURANT",
  "email": "user@example.com",
  "clientId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Get Account by ID
```
GET http://localhost:3000/api/comptes/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
```
**Replace with actual account ID from create response**

### Get Account by Number
```
GET http://localhost:3000/api/comptes/numero/FR7676857320bpbvhvpmejk
```
**Replace with actual numeroCompte from create response**

### Update Account
```
PUT http://localhost:3000/api/comptes/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
Content-Type: application/json

{
  "solde": 15000,
  "email": "newemail@example.com"
}
```

### Delete Account
```
DELETE http://localhost:3000/api/comptes/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
```

---

## 3️⃣ TRANSACTIONS API

### Create Deposit
```
POST http://localhost:3000/api/transactions/deposit
Content-Type: application/json

{
  "type": "deposit",
  "toAccount": "FR7676857320bpbvhvpmejk",
  "amount": 1000,
  "currency": "TND",
  "description": "Salary deposit"
}
```

### Create Withdrawal
```
POST http://localhost:3000/api/transactions/withdrawal
Content-Type: application/json

{
  "type": "withdrawal",
  "fromAccount": "FR7676857320bpbvhvpmejk",
  "amount": 500,
  "currency": "TND",
  "description": "ATM withdrawal"
}
```

### Create Internal Transfer
```
POST http://localhost:3000/api/transactions/transfer
Content-Type: application/json

{
  "type": "transfer",
  "fromAccount": "FR7676857320bpbvhvpmejk",
  "toAccount": "ACC_456",
  "amount": 200,
  "currency": "TND",
  "description": "Transfer to friend"
}
```

### Get All Transactions
```
GET http://localhost:3000/api/transactions
```

### Get Transaction by ID
```
GET http://localhost:3000/api/transactions/TXN_ABC123
```
**Replace with actual transaction ID**

### Get Transactions by Account
```
GET http://localhost:3000/api/transactions/account/FR7676857320bpbvhvpmejk
```

### Update Transaction
```
PUT http://localhost:3000/api/transactions/TXN_ABC123
Content-Type: application/json

{
  "description": "Updated description",
  "status": "completed"
}
```

### Delete Transaction
```
DELETE http://localhost:3000/api/transactions/TXN_ABC123
```

---

## 4️⃣ MOUVEMENTS API (ADMIN)

### Admin Credit (Add Money)
```
POST http://localhost:3000/api/mouvements/credit/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
Content-Type: application/json

{
  "montant": 1000,
  "description": "Promotional bonus",
  "adminUser": "admin@bank.com"
}
```

### Admin Debit (Remove Money)
```
POST http://localhost:3000/api/mouvements/debit/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
Content-Type: application/json

{
  "montant": 200,
  "description": "Fee correction",
  "adminUser": "admin@bank.com"
}
```

### Get All Mouvements
```
GET http://localhost:3000/api/mouvements
```

### Get Mouvements by Account ID
```
GET http://localhost:3000/api/mouvements/compte/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
```

### Get Mouvement by ID
```
GET http://localhost:3000/api/mouvements/mouv-id-here
```

### Get Mouvements by Transaction Reference
```
GET http://localhost:3000/api/mouvements/transaction/transaction-ref-here
```

### Get Account Statistics
```
GET http://localhost:3000/api/mouvements/stats/80d807cc-53bb-4cc3-aa5b-837b7854cdf8
```

### Filter Mouvements by Type
```
GET http://localhost:3000/api/mouvements/filter/80d807cc-53bb-4cc3-aa5b-837b7854cdf8?type=CREDIT
```
**Or use:** `?type=DEBIT`

---

## 5️⃣ CATEGORIES API

### Get All Categories
```
GET http://localhost:3000/api/categories
```

### Create Category
```
POST http://localhost:3000/api/categories
Content-Type: application/json

{
  "name": "Food & Dining",
  "type": "expense",
  "color": "#FF6B6B",
  "icon": "restaurant"
}
```

### Get Category by ID
```
GET http://localhost:3000/api/categories/category-id-here
```

### Update Category
```
PUT http://localhost:3000/api/categories/category-id-here
Content-Type: application/json

{
  "name": "Dining & Restaurants",
  "color": "#FF0000"
}
```

### Delete Category
```
DELETE http://localhost:3000/api/categories/category-id-here
```

### Toggle Category Active Status
```
PATCH http://localhost:3000/api/categories/category-id-here/toggle
```

---

## 🎯 POSTMAN QUICK START WORKFLOW

### Step 1: Create Account
```
POST http://localhost:3000/api/comptes

{
  "numeroCompte": "POSTMAN_001",
  "solde": 10000,
  "devise": "TND",
  "typeCompte": "COURANT",
  "email": "test@postman.com",
  "clientId": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Copy the `_id` from response!**

---

### Step 2: Make a Deposit
```
POST http://localhost:3000/api/transactions/deposit

{
  "type": "deposit",
  "toAccount": "YOUR_NUMERO_COMPTE_HERE",
  "amount": 5000,
  "currency": "TND",
  "description": "Test deposit"
}
```

---

### Step 3: Check Account Balance
```
GET http://localhost:3000/api/comptes
```
**Balance should have increased!**

---

### Step 4: Admin Operation
```
POST http://localhost:3000/api/mouvements/credit/YOUR_ACCOUNT_ID_HERE

{
  "montant": 1000,
  "description": "Bonus",
  "adminUser": "admin@postman.com"
}
```

---

### Step 5: View Mouvements
```
GET http://localhost:3000/api/mouvements/compte/YOUR_ACCOUNT_ID_HERE
```
**See both regular transactions and admin mouvements!**

---

## 📊 POSTMAN ENVIRONMENT VARIABLES

Create these variables in Postman:

```
gateway_url = http://localhost:3000
account_id = 80d807cc-53bb-4cc3-aa5b-837b7854cdf8
numero_compte = FR7676857320bpbvhvpmejk
```

Then use:
```
GET {{gateway_url}}/api/comptes/{{account_id}}
POST {{gateway_url}}/api/transactions/deposit
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Gateway health works
- [ ] Can create account
- [ ] Can get all accounts
- [ ] Can make deposit
- [ ] Can make withdrawal
- [ ] Can make transfer
- [ ] Can do admin credit
- [ ] Can do admin debit
- [ ] Can create category
- [ ] Can view mouvements

---

## 🔍 VALID TEST DATA

### Valid UUIDs (for clientId):
```
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
6ba7b811-9dad-11d1-80b4-00c04fd430c8
```

### Valid Type Values:
- **typeCompte:** `COURANT` or `EPARGNE`
- **transaction type:** `deposit`, `withdrawal`, `transfer`
- **mouvement type:** `CREDIT` or `DEBIT`
- **category type:** `expense` or `income`

### Valid Currency:
- `TND` (Tunisian Dinar)
- `USD`, `EUR` also supported

---

## 🚀 ALL LINKS READY!

**Just copy-paste into Postman and test!**

**Remember:** Always use **port 3000** (Gateway) - Never direct ports 3001, 3002, or 3004!

---

**HAPPY TESTING! 🎉**
