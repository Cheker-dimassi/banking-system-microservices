# 🎯 ALL WORKING POSTMAN LINKS - COPY & PASTE READY

## ✅ YOUR TEST ACCOUNT
**Account ID:** `53d3c1de-76a7-4241-ac77-8225b41f715a`
**Account Number:** `FR7676910706etq7zqs8sz8`

---

## 📁 ACCOUNTS API

### 1. GET All Accounts
```
GET http://localhost:3000/api/comptes
```

### 2. POST Create Account
```
POST http://localhost:3000/api/comptes
Content-Type: application/json

{
  "numeroCompte": "ACC_NEW_002",
  "solde": 5000,
  "devise": "TND",
  "typeCompte": "COURANT",
  "email": "newuser@example.com",
  "clientId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

### 3. GET Account by ID
```
GET http://localhost:3000/api/comptes/53d3c1de-76a7-4241-ac77-8225b41f715a
```

### 4. PUT Update Account
```
PUT http://localhost:3000/api/comptes/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "solde": 20000,
  "email": "updated@example.com"
}
```

### 5. DELETE Account
```
DELETE http://localhost:3000/api/comptes/53d3c1de-76a7-4241-ac77-8225b41f715a
```

---

## 💰 TRANSACTIONS API

### 6. POST Make Deposit
```
POST http://localhost:3000/api/transactions/deposit
Content-Type: application/json

{
  "type": "deposit",
  "toAccount": "FR7676910706etq7zqs8sz8",
  "amount": 1000,
  "currency": "TND",
  "description": "Salary deposit"
}
```

### 7. POST Make Withdrawal
```
POST http://localhost:3000/api/transactions/withdrawal
Content-Type: application/json

{
  "type": "withdrawal",
  "fromAccount": "FR7676910706etq7zqs8sz8",
  "amount": 500,
  "currency": "TND",
  "description": "ATM withdrawal"
}
```

### 8. POST Internal Transfer
```
POST http://localhost:3000/api/transactions/transfer
Content-Type: application/json

{
  "type": "transfer",
  "fromAccount": "FR7676910706etq7zqs8sz8",
  "toAccount": "ACC_456",
  "amount": 200,
  "currency": "TND",
  "description": "Transfer to friend"
}
```

### 9. GET All Transactions
```
GET http://localhost:3000/api/transactions
```

### 10. GET Transactions by Account
```
GET http://localhost:3000/api/transactions/account/FR7676910706etq7zqs8sz8
```

### 11. GET Transaction by ID
```
GET http://localhost:3000/api/transactions/TXN_B5BC5E1F
```
**Replace TXN_B5BC5E1F with actual transaction ID from previous responses**

### 12. PUT Update Transaction
```
PUT http://localhost:3000/api/transactions/TXN_B5BC5E1F
Content-Type: application/json

{
  "description": "Updated description",
  "status": "completed"
}
```

### 13. DELETE Transaction
```
DELETE http://localhost:3000/api/transactions/TXN_B5BC5E1F
```

---

## 🔧 MOUVEMENTS API (ADMIN)

### 14. POST Admin Credit (Add Money)
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 1000,
  "description": "Promotional bonus",
  "adminUser": "admin@bank.com"
}
```

### 15. POST Admin Debit (Remove Money)
```
POST http://localhost:3000/api/mouvements/debit/53d3c1de-76a7-4241-ac77-8225b41f715a
Content-Type: application/json

{
  "montant": 200,
  "description": "Fee correction",
  "adminUser": "admin@bank.com"
}
```

### 16. GET All Mouvements
```
GET http://localhost:3000/api/mouvements
```

### 17. GET Mouvements by Account
```
GET http://localhost:3000/api/mouvements/compte/53d3c1de-76a7-4241-ac77-8225b41f715a
```

### 18. GET Credits Only (Filter)
```
GET http://localhost:3000/api/mouvements/filter/53d3c1de-76a7-4241-ac77-8225b41f715a?type=CREDIT
```

### 19. GET Debits Only (Filter)
```
GET http://localhost:3000/api/mouvements/filter/53d3c1de-76a7-4241-ac77-8225b41f715a?type=DEBIT
```

### 20. GET Account Statistics
```
GET http://localhost:3000/api/mouvements/stats/53d3c1de-76a7-4241-ac77-8225b41f715a
```

### 21. GET Mouvement by ID
```
GET http://localhost:3000/api/mouvements/MOUV_ID_HERE
```
**Replace with actual mouvement ID**

### 22. GET Mouvements by Transaction Reference
```
GET http://localhost:3000/api/mouvements/transaction/TXN_ID_HERE
```
**Replace with actual transaction reference**

---

## 📚 CATEGORIES API

### 23. GET All Categories
```
GET http://localhost:3000/api/categories
```

### 24. POST Create Category
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

### 25. GET Category by ID
```
GET http://localhost:3000/api/categories/CATEGORY_ID_HERE
```

### 26. PUT Update Category
```
PUT http://localhost:3000/api/categories/CATEGORY_ID_HERE
Content-Type: application/json

{
  "name": "Dining & Restaurants",
  "color": "#FF0000"
}
```

### 27. DELETE Category
```
DELETE http://localhost:3000/api/categories/CATEGORY_ID_HERE
```

### 28. PATCH Toggle Category Status
```
PATCH http://localhost:3000/api/categories/CATEGORY_ID_HERE/toggle
```

---

## ❤️ HEALTH CHECKS

### 29. GET Gateway Health
```
GET http://localhost:3000/health
```

### 30. GET Gateway Info
```
GET http://localhost:3000/
```

---

## 🎯 POSTMAN COLLECTION STRUCTURE

Create folders in Postman:

```
📁 Banking System (Docker)
  ├─📁 Health Checks
  │  ├─ GET Gateway Health
  │  └─ GET Gateway Info
  ├─📁 Accounts
  │  ├─ GET All Accounts
  │  ├─ POST Create Account
  │  ├─ GET Account by ID
  │  ├─ PUT Update Account
  │  └─ DELETE Account
  ├─📁 Transactions
  │  ├─ POST Deposit
  │  ├─ POST Withdrawal
  │  ├─ POST Transfer
  │  ├─ GET All Transactions
  │  ├─ GET Transactions by Account
  │  ├─ GET Transaction by ID
  │  ├─ PUT Update Transaction
  │  └─ DELETE Transaction
  ├─📁 Mouvements (Admin)
  │  ├─ POST Admin Credit
  │  ├─ POST Admin Debit
  │  ├─ GET All Mouvements
  │  ├─ GET Mouvements by Account
  │  ├─ GET Credits Only
  │  ├─ GET Debits Only
  │  ├─ GET Statistics
  │  ├─ GET Mouvement by ID
  │  └─ GET by Transaction Ref
  └─📁 Categories
     ├─ GET All Categories
     ├─ POST Create Category
     ├─ GET Category by ID
     ├─ PUT Update Category
     ├─ DELETE Category
     └─ PATCH Toggle Status
```

---

## 📊 POSTMAN ENVIRONMENT VARIABLES

Set these in Postman Environment:

```javascript
gateway_url = http://localhost:3000
account_id = 53d3c1de-76a7-4241-ac77-8225b41f715a
numero_compte = FR7676910706etq7zqs8sz8
```

Then you can use:
```
POST {{gateway_url}}/api/transactions/deposit
GET {{gateway_url}}/api/comptes/{{account_id}}
```

---

## ✅ QUICK TEST SEQUENCE

**1. Check Gateway:**
```
GET http://localhost:3000/health
```

**2. View Accounts:**
```
GET http://localhost:3000/api/comptes
```

**3. Make Deposit:**
```
POST http://localhost:3000/api/transactions/deposit
{
  "type": "deposit",
  "toAccount": "FR7676910706etq7zqs8sz8",
  "amount": 500,
  "currency": "TND",
  "description": "Test"
}
```

**4. Check Balance:**
```
GET http://localhost:3000/api/comptes/53d3c1de-76a7-4241-ac77-8225b41f715a
```

**5. Admin Credit:**
```
POST http://localhost:3000/api/mouvements/credit/53d3c1de-76a7-4241-ac77-8225b41f715a
{
  "montant": 1000,
  "description": "Bonus",
  "adminUser": "admin@test.com"
}
```

**6. View Mouvements:**
```
GET http://localhost:3000/api/mouvements/compte/53d3c1de-76a7-4241-ac77-8225b41f715a
```

---

## 🎉 ALL 30 ENDPOINTS READY!

**Just copy-paste into Postman!**

**Remember:**
- ✅ Always use port **3000** (Gateway)
- ✅ Use **POST** to create/add
- ✅ Use **GET** to view/read
- ✅ Use **PUT** to update
- ✅ Use **DELETE** to remove

---

**HAPPY TESTING! 🚀**
