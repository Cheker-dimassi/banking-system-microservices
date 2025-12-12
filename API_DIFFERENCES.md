# 🔄 API DIFFERENCES - TRANSACTIONS VS MOUVEMENTS

## 🎯 CLEAR SEPARATION OF CONCERNS

Now the two APIs serve completely different purposes!

---

## 💳 TRANSACTIONS API - Customer Banking Operations

**Purpose:** External customer transactions with full banking features

**Who uses it:** Customers, Mobile apps, ATMs, Online banking

**Features:**
- ✅ Fraud detection
- ✅ Transaction limits
- ✅ Fee calculation  
- ✅ Balance checks
- ✅ Security validation
- ✅ Automatic rollback on failure

**Example - Customer Deposit:**
```
POST http://localhost:3000/api/transactions/deposit
{
  "type": "deposit",
  "toAccount": "EXT_999",
  "amount": 1000,
  "currency": "TND",
  "description": "Monthly salary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit completed successfully",
  "transaction": {
    "transactionId": "TXN_ABC123",
    "type": "deposit",
    "amount": 1000,
    "status": "completed",
    "fees": 0,
    "fraudFlag": false
  }
}
```

---

## ⚙️ MOUVEMENTS API - Admin Account Management

**Purpose:** Internal admin operations and account adjustments

**Who uses it:** Bank admins, Internal systems, Account managers

**Features:**
- ✅ Direct balance adjustments
- ✅ Admin audit logging
- ✅ No transaction fees
- ✅ No fraud checks (trusted operations)
- ✅ Faster processing
- ✅ Account corrections

**Example - Admin Correction:**
```
POST http://localhost:3000/api/mouvements/credit/ce46dad3-d6b1-4127-8116-1057a2ada8f3
{
  "montant": 500,
  "description": "Balance correction",
  "adminUser": "admin@bank.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compte crédité avec succès (Admin operation)",
  "data": {
    "_id": "...",
    "typeMouvement": "CREDIT",
    "montant": 500,
    "description": "[ADMIN] Balance correction"
  },
  "audit": {
    "operationType": "ADMIN_CREDIT",
    "performedBy": "admin@bank.com",
    "timestamp": "2025-12-09T08:35:00Z"
  }
}
```

---

## 📊 COMPARISON TABLE

| Feature | Transactions API | Mouvements API |
|---------|-----------------|----------------|
| **Purpose** | Customer banking | Admin operations |
| **Users** | Customers | Bank admins |
| **Fraud checks** | ✅ Yes | ❌ No (trusted) |
| **Transaction fees** | ✅ Calculated | ❌ No fees |
| **Limits** | ✅ Enforced | ❌ No limits |
| **Audit trail** | Transaction log | Admin audit log |
| **Speed** | Normal (with checks) | Fast (direct) |
| **Reversal** | Automatic saga | Manual |
| **Description prefix** | None | `[ADMIN]` |
| **Response includes** | Fees, fraud flags | Audit info |

---

## 🎯 USE CASES

### **USE TRANSACTIONS API FOR:**

1. **Customer Deposits**
   - Salary deposits
   - Cash deposits at branch
   - Check deposits

2. **Customer Withdrawals**
   - ATM withdrawals
   - Cash withdrawals at branch
   - Wire transfers out

3. **Customer Transfers**
   - Transfer between accounts
   - Bill payments
   - Person-to-person transfers

**Example:**
```
POST /api/transactions/withdrawal
{
  "type": "withdrawal",
  "fromAccount": "FR7666086678dlsng3mf70l",
  "amount": 500,
  "description": "ATM withdrawal"
}
```

---

### **USE MOUVEMENTS API FOR:**

1. **Balance Corrections**
   - Fix accounting errors
   - Interest adjustments
   - Fee reversals

2. **Admin Adjustments**
   - Promotional credits
   - Compensation for errors
   - Special account operations

3. **System Operations**
   - Month-end processing
   - Interest posting
   - Maintenance adjustments

**Example:**
```
POST /api/mouvements/credit/794cfdd0-14f5-4d25-bfa5-fd2f5a25faac
{
  "montant": 100,
  "description": "Fee reversal",
  "adminUser": "john.admin@bank.com"
}
```

---

## 🔍 KEY DIFFERENCES IN PRACTICE

### **Transactions API:**
- Checks if account is active ✅
- Validates sufficient balance ✅
- Applies transaction fees ✅
- Runs fraud detection ✅
- Enforces daily limits ✅
- Creates detailed transaction record ✅

### **Mouvements API:**
- Direct balance update ⚡
- No checks (admin trusted) 🔐
- No fees applied 💰
- Prefixes description with `[ADMIN]` 📝
- Logs admin user in console 📊
- Includes audit object in response ✅

---

## 📝 EXAMPLE SCENARIOS

### **Scenario 1: Customer makes a deposit**
**Use:** `POST /api/transactions/deposit`
**Why:** Full banking validation needed, customer operation

---

### **Scenario 2: Admin fixes incorrect balance**
**Use:** `POST /api/mouvements/credit/:id`
**Why:** Trusted admin operation, no fees, direct correction

---

### **Scenario 3: ATM withdrawal**
**Use:** `POST /api/transactions/withdrawal`
**Why:** Need fraud check, limit enforcement, fee calculation

---

### **Scenario 4: Month-end interest posting**
**Use:** `POST /api/mouvements/credit/:id` (for each account)
**Why:** Automated system operation, no customer validation needed

---

## ✅ BOTH APIS WORK INDEPENDENTLY

- ✅ Transactions API maintains its own transaction records
- ✅ Mouvements API maintains account movement history
- ✅ No sync between them (different purposes!)
- ✅ Both update account balances correctly
- ✅ Can query each API independently

---

## 🚀 READY FOR DEMO!

**Show the difference:**

1. Make a customer deposit: `POST /api/transactions/deposit`
   - Point out fraud checks, fees, limits

2. Make an admin correction: `POST /apt/mouvements/credit/:id`
   - Point out `[ADMIN]` prefix, audit log, no fees

3. Query both:
   - `GET /api/transactions/account/EXT_999` - shows customer transactions
   - `GET /api/mouvements/compte/:uuid` - shows all movements including admin

**Perfect for showing microservices architecture!** 🎉

