# ✅ WORKING DEPOSITS & WITHDRAWALS

## 🎯 USE MOUVEMENTS API - NOT TRANSACTIONS API!

---

## 💰 DEPOSIT (CREDIT)

### **Step 1: Get Account**
```
GET http://localhost:3000/api/comptes
```

### **Step 2: Copy Account ID**
From response, copy the `_id` field (UUID)

### **Step 3: Make Deposit**
```
POST http://localhost:3000/api/mouvements/credit/{ACCOUNT_ID}
Content-Type: application/json

{
  "montant": 1000,
  "description": "Monthly salary",
  "reference": "SAL_DEC_2024"
}
```

**✅ Example:**
```
POST http://localhost:3000/api/mouvements/credit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac
Content-Type: application/json

{
  "montant": 1000,
  "description": "Salary deposit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compte crédité avec succès",
  "data": {
    "typeMouvement": "CREDIT",
    "montant": 1000,
    "description": "Salary deposit",
    "referenceTransaction": "uuid-here",
    ...
  }
}
```

---

## 💸 WITHDRAWAL (DEBIT)

### **Step 1: Get Account**
```
GET http://localhost:3000/api/comptes
```

### **Step 2: Copy Account ID**
From response, copy the `_id` field (UUID)

### **Step 3: Make Withdrawal**
```
POST http://localhost:3000/api/mouvements/debit/{ACCOUNT_ID}
Content-Type: application/json

{
  "montant": 500,
  "description": "ATM withdrawal",
  "reference": "WD_DEC_001"
}
```

**✅ Example:**
```
POST http://localhost:3000/api/mouvements/debit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac
Content-Type: application/json

{
  "montant": 100,
  "description": "ATM withdrawal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compte débité avec succès",
  "data": {
    "typeMouvement": "DEBIT",
    "montant": 100,
    "description": "ATM withdrawal",
    ...
  }
}
```

---

## 📊 COMPLETE FLOW EXAMPLE

### **1. Check Balance**
```
GET http://localhost:3000/api/comptes
```

**Response shows:**
```json
{
  "data": [
    {
      "_id": "794cfdd0-14f5-4d25-bfa5-fd2f5a25faac",
      "numeroCompte": "FR76...",
      "solde": 13500,  ← Current balance
      "devise": "TND"
    }
  ]
}
```

---

### **2. Make Deposit**
```
POST http://localhost:3000/api/mouvements/credit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac

{
  "montant": 2000,
  "description": "Salary December 2024",
  "reference": "SAL_DEC_2024"
}
```

**New balance: 15500 TND** (13500 + 2000)

---

### **3. Make Withdrawal**
```
POST http://localhost:3000/api/mouvements/debit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac

{
  "montant": 500,
  "description": "Shopping",
  "reference": "SHOP_001"
}
```

**New balance: 15000 TND** (15500 - 500)

---

### **4. View All Movements**
```
GET http://localhost:3000/api/mouvements/compte/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac
```

**Shows both movements:**
```json
{
  "success": true,
  "data": [
    {
      "typeMouvement": "CREDIT",
      "montant": 2000,
      "description": "Salary December 2024"
    },
    {
      "typeMouvement": "DEBIT",
      "montant": 500,
      "description": "Shopping"
    }
  ]
}
```

---

## 🎬 POSTMAN COLLECTION

### **Request 1: Get Accounts**
```
GET http://localhost:3000/api/comptes
```

**In Tests tab, save account ID:**
```javascript
pm.environment.set("accountId", pm.response.json().data[0]._id);
```

---

### **Request 2: Deposit**
```
POST http://localhost:3000/api/mouvements/credit/{{accountId}}
Content-Type: application/json

{
  "montant": 1000,
  "description": "Deposit test",
  "reference": "DEP_001"
}
```

---

### **Request 3: Withdrawal**
```
POST http://localhost:3000/api/mouvements/debit/{{accountId}}
Content-Type: application/json

{
  "montant": 200,
  "description": "Withdrawal test",
  "reference": "WD_001"
}
```

---

### **Request 4: Check Balance**
```
GET http://localhost:3000/api/comptes
```

---

### **Request 5: View Movements**
```
GET http://localhost:3000/api/mouvements/compte/{{accountId}}
```

---

## 📋 QUICK REFERENCE

| Operation | Method | Endpoint | Body Fields |
|-----------|--------|----------|-------------|
| **Deposit** | POST | `/api/mouvements/credit/:id` | `montant`, `description`, `reference` (optional) |
| **Withdrawal** | POST | `/api/mouvements/debit/:id` | `montant`, `description`, `reference` (optional) |
| **View Balance** | GET | `/api/comptes` | - |
| **View Movements** | GET | `/api/mouvements/compte/:id` | - |
| **View All Movements** | GET | `/api/mouvements` | - |

---

## ⚠️ IMPORTANT NOTES

### **Required Fields:**
- ✅ `montant` (number) - Amount
- ✅ `description` (string) - Description
- ⚠️ `reference` (string, optional) - Transaction reference

### **Account ID:**
- Must be the `_id` from `/api/comptes` (UUID format)
- NOT `numeroCompte`
- NOT simple IDs like `ACC_123`

### **Example Valid Account ID:**
```
794cfdd0-14f5-4d25-bfa5-fd2f5a25faac  ✅
FR7612345678901234567890123           ❌ (this is numeroCompte)
ACC_123                                ❌ (not in accounts-service)
```

---

## 🚫 DON'T USE THESE (They don't work with accounts-service):

```
❌ POST /api/transactions/deposit
❌ POST /api/transactions/withdrawal
❌ POST /api/transactions/internal-transfer
```

**Why?** These try to use ACC_123/EXT_999 IDs which don't exist in accounts-service!

---

## ✅ USE THESE INSTEAD:

```
✅ POST /api/mouvements/credit/:uuid
✅ POST /api/mouvements/debit/:uuid
✅ GET /api/mouvements/compte/:uuid
```

**Why?** These work directly with accounts-service using proper UUIDs!

---

## 🎯 TEACHER DEMO SCRIPT

### **Demo 1: Show Account Balance** (30 sec)
```
GET http://localhost:3000/api/comptes
```

**Say:** "Here are the accounts in our system with their current balances stored in MongoDB."

---

### **Demo 2: Make Deposit** (1 min)
```
POST http://localhost:3000/api/mouvements/credit/{uuid}
Body: {"montant": 2000, "description": "Monthly salary", "reference": "SAL_DEC"}
```

**Say:** "I'm making a deposit of 2000 TND. This goes through the Gateway to the Accounts Service, which updates the balance in MongoDB."

---

### **Demo 3: Make Withdrawal** (1 min)
```
POST http://localhost:3000/api/mouvements/debit/{uuid}
Body: {"montant": 500, "description": "ATM withdrawal", "reference": "WD_001"}
```

**Say:** "Now making a withdrawal of 500 TND. Same process - Gateway → Accounts Service → MongoDB."

---

### **Demo 4: Show Updated Balance** (30 sec)
```
GET http://localhost:3000/api/comptes
```

**Say:** "You can see the balance has been updated. Started at X, added 2000, minus 500, now showing Y."

---

### **Demo 5: View Transaction History** (1 min)
```
GET http://localhost:3000/api/mouvements/compte/{uuid}
```

**Say:** "Here's the complete transaction history for this account - both the credit and debit transactions we just made, all stored in MongoDB with timestamps and references."

---

## ✅ CONFIRMED WORKING

**Tested and working:**
- ✅ Deposit via `/api/mouvements/credit/:uuid`
- ✅ Withdrawal via `/api/mouvements/debit/:uuid`
- ✅ View movements via `/api/mouvements/compte/:uuid`
- ✅ Check balance via `/api/comptes`

**Total: 4 core operations all working!** 🎉

---

**USE MOUVEMENTS API FOR ALL DEPOSITS & WITHDRAWALS! 🚀**

