# Postman Testing Guide: Métier 2 - Security & Limits

Complete testing guide for all Security & Limits Management endpoints.

**Base URL:** `http://localhost:3001`

---

## 📁 Métier 2: Security & Limits Management

### 1. Get Account Limits

**Purpose:** Get transaction limits for a specific account (daily withdrawal, daily transfer, single transaction limits).

**Request:**
```
GET http://localhost:3001/transactions/limits/ACC_123
```

**Headers:**
```
Content-Type: application/json
```

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "accountId": "ACC_123",
  "limits": {
    "dailyWithdrawal": {
      "used": 0,
      "limit": 50000,
      "remaining": 50000
    },
    "dailyTransfer": {
      "used": 0,
      "limit": 100000,
      "remaining": 100000
    },
    "singleTransaction": 20000,
    "minTransaction": 1
  }
}
```

**Test Cases:**
- ✅ Valid account: `ACC_123`, `ACC_456`, `EXT_999`
- ❌ Invalid account: `ACC_999` → `404 Account not found`

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/limits/{{accountId}}`
3. Use environment variable: `accountId = ACC_123`

---

### 2. Update Account Limits

**Purpose:** Update custom transaction limits for a specific account.

**Request:**
```
PUT http://localhost:3001/transactions/limits/ACC_123
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "dailyWithdrawal": 10000,
  "dailyTransfer": 20000,
  "singleTransaction": 5000
}
```

**All fields are optional** - only include what you want to update.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Account limits updated successfully",
  "accountId": "ACC_123",
  "limits": {
    "dailyWithdrawal": 10000,
    "dailyTransfer": 20000,
    "singleTransaction": 5000
  }
}
```

**Test Cases:**
- ✅ Update all limits
- ✅ Update only dailyWithdrawal
- ✅ Update only dailyTransfer
- ✅ Update only singleTransaction
- ❌ Invalid account: `ACC_999` → `404 Account not found`

**Postman Setup:**
1. Method: `PUT`
2. URL: `http://localhost:3001/transactions/limits/{{accountId}}`
3. Body → raw → JSON
4. Use environment variable: `accountId = ACC_123`

**Example Body Variations:**

**Update only withdrawal limit:**
```json
{
  "dailyWithdrawal": 15000
}
```

**Update only transfer limit:**
```json
{
  "dailyTransfer": 25000
}
```

**Update only single transaction limit:**
```json
{
  "singleTransaction": 8000
}
```

---

### 3. Fraud Check

**Purpose:** Check if a transaction is suspicious or fraudulent before executing it.

**Request:**
```
POST http://localhost:3001/transactions/fraud-check
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 15000,
  "currency": "TND",
  "description": "Large withdrawal"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "fraudCheck": {
    "isFraud": true,
    "flags": [
      "SUSPICIOUS_AMOUNT"
    ],
    "securityLevel": "high"
  }
}
```

**Fraud Detection Rules:**
- **SUSPICIOUS_AMOUNT:** Amount ≥ 10,000 TND
- **RAPID_TRANSACTIONS:** 5+ transactions in 1 hour
- **OUTSIDE_BUSINESS_HOURS:** Large transaction (≥5,000 TND) outside 8 AM - 6 PM

**Security Levels:**
- `high`: Suspicious amount OR rapid transactions
- `medium`: Amount ≥ 5,000 TND
- `low`: Normal transaction

**Test Cases:**

**1. Normal Transaction (No Fraud):**
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 500,
  "currency": "TND"
}
```
**Response:**
```json
{
  "success": true,
  "fraudCheck": {
    "isFraud": false,
    "flags": [],
    "securityLevel": "low"
  }
}
```

**2. Suspicious Amount (Fraud Detected):**
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 15000,
  "currency": "TND"
}
```
**Response:**
```json
{
  "success": true,
  "fraudCheck": {
    "isFraud": true,
    "flags": ["SUSPICIOUS_AMOUNT"],
    "securityLevel": "high"
  }
}
```

**3. Medium Security Level:**
```json
{
  "type": "internal_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "ACC_456",
  "amount": 6000,
  "currency": "TND"
}
```
**Response:**
```json
{
  "success": true,
  "fraudCheck": {
    "isFraud": false,
    "flags": [],
    "securityLevel": "medium"
  }
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/fraud-check`
3. Body → raw → JSON

---

### 4. Reverse Transaction

**Purpose:** Reverse a completed transaction (create a reversal transaction).

**Request:**
```
POST http://localhost:3001/transactions/TXN_A1B2C3D4/reverse
```

**Headers:**
```
Content-Type: application/json
```

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction reversed successfully",
  "originalTransaction": {
    "transactionId": "TXN_A1B2C3D4",
    "type": "internal_transfer",
    "amount": 1000,
    "status": "reversed",
    "fromAccount": "ACC_123",
    "toAccount": "ACC_456"
  },
  "reversalTransaction": {
    "transactionId": "TXN_E5F6G7H8",
    "type": "internal_transfer",
    "amount": 1000,
    "status": "completed",
    "fromAccount": "ACC_456",
    "toAccount": "ACC_123",
    "description": "Reversal of TXN_A1B2C3D4"
  }
}
```

**Important Notes:**
- ✅ Only **completed** transactions can be reversed
- ❌ Cannot reverse a transaction that's already reversed
- ❌ Cannot reverse **pending** or **failed** transactions
- The reversal creates a new transaction in the opposite direction

**Test Flow:**

**Step 1: Create a transaction first**
```
POST http://localhost:3001/transactions/internal-transfer
Body:
{
  "type": "internal_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "ACC_456",
  "amount": 1000,
  "currency": "TND",
  "description": "Test transfer"
}
```

**Step 2: Copy the transactionId from response**
```json
{
  "transaction": {
    "transactionId": "TXN_A1B2C3D4"  ← Copy this!
  }
}
```

**Step 3: Reverse the transaction**
```
POST http://localhost:3001/transactions/TXN_A1B2C3D4/reverse
```

**Test Cases:**
- ✅ Reverse completed transaction → Success
- ❌ Reverse non-existent transaction → `404 Transaction not found`
- ❌ Reverse already reversed transaction → `400 Transaction already reversed`
- ❌ Reverse pending transaction → `400 Only completed transactions can be reversed`

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/{{transactionId}}/reverse`
3. Use environment variable: `transactionId = TXN_A1B2C3D4`

**Pro Tip:** Use Postman Tests tab to auto-save transactionId:
```javascript
// After creating transaction
pm.environment.set("transactionId", pm.response.json().transaction.transactionId);
```

---

### 5. Get Suspicious Transactions

**Purpose:** Get all suspicious transactions for a specific account (flagged for fraud or high security level).

**Request:**
```
GET http://localhost:3001/transactions/suspicious/ACC_123
```

**Headers:**
```
Content-Type: application/json
```

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "accountId": "ACC_123",
  "count": 2,
  "transactions": [
    {
      "transactionId": "TXN_A1B2C3D4",
      "type": "withdrawal",
      "amount": 15000,
      "status": "completed",
      "fraudFlag": true,
      "securityLevel": "high",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "transactionId": "TXN_E5F6G7H8",
      "type": "interbank_transfer",
      "amount": 12000,
      "status": "completed",
      "fraudFlag": true,
      "securityLevel": "high",
      "timestamp": "2024-01-15T11:45:00.000Z"
    }
  ]
}
```

**What Makes a Transaction Suspicious:**
- `fraudFlag: true` - Transaction was flagged during fraud detection
- `securityLevel: "high"` - High security level (suspicious amount or rapid transactions)

**Test Cases:**
- ✅ Account with suspicious transactions → Returns list
- ✅ Account with no suspicious transactions → Returns empty array
- ❌ Invalid account: `ACC_999` → `404 Account not found`

**To Create Suspicious Transactions for Testing:**

**1. Create a large withdrawal (≥10,000 TND):**
```
POST http://localhost:3001/transactions/withdrawal
Body:
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 15000,
  "currency": "TND"
}
```

**2. Check suspicious transactions:**
```
GET http://localhost:3001/transactions/suspicious/ACC_123
```

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/suspicious/{{accountId}}`
3. Use environment variable: `accountId = ACC_123`

---

## Complete Test Flow for Métier 2

### Step-by-Step Testing:

**1. Get Account Limits**
```
GET /transactions/limits/ACC_123
```
✅ Check current limits

**2. Update Account Limits**
```
PUT /transactions/limits/ACC_123
Body: { "dailyWithdrawal": 10000 }
```
✅ Update limits

**3. Create a Large Transaction (to trigger fraud)**
```
POST /transactions/withdrawal
Body: { "type": "withdrawal", "fromAccount": "ACC_123", "amount": 15000 }
```
✅ Creates suspicious transaction

**4. Check Fraud Before Transaction**
```
POST /transactions/fraud-check
Body: { "type": "withdrawal", "fromAccount": "ACC_123", "amount": 15000 }
```
✅ Verify fraud detection

**5. Get Suspicious Transactions**
```
GET /transactions/suspicious/ACC_123
```
✅ See flagged transactions

**6. Reverse a Transaction**
```
POST /transactions/{transactionId}/reverse
```
✅ Reverse the transaction

---

## Postman Environment Variables

Create these variables in your Postman environment:

```
base_url = http://localhost:3001
account_id = ACC_123
transaction_id = TXN_A1B2C3D4
```

**Use in requests:**
- `{{base_url}}/transactions/limits/{{account_id}}`
- `{{base_url}}/transactions/{{transaction_id}}/reverse`

---

## Error Responses

### 404 - Account Not Found
```json
{
  "success": false,
  "error": "Account not found"
}
```

### 404 - Transaction Not Found
```json
{
  "success": false,
  "error": "Transaction not found",
  "hint": "Make sure you are using the correct transactionId (e.g., TXN_XXXXXXXX)"
}
```

### 400 - Invalid Request
```json
{
  "success": false,
  "error": "Only completed transactions can be reversed"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/transactions/limits/:accountId` | GET | Get account limits |
| `/transactions/limits/:accountId` | PUT | Update account limits |
| `/transactions/fraud-check` | POST | Check for fraud |
| `/transactions/:id/reverse` | POST | Reverse transaction |
| `/transactions/suspicious/:accountId` | GET | Get suspicious transactions |

---

## Testing Checklist

- [ ] Get account limits for ACC_123
- [ ] Update account limits (dailyWithdrawal)
- [ ] Update account limits (dailyTransfer)
- [ ] Update account limits (singleTransaction)
- [ ] Check fraud for normal transaction (should pass)
- [ ] Check fraud for suspicious amount (should flag)
- [ ] Create large transaction to generate suspicious activity
- [ ] Get suspicious transactions for account
- [ ] Create a transaction
- [ ] Reverse the transaction
- [ ] Try to reverse already reversed transaction (should fail)
- [ ] Test with invalid account ID (should return 404)

---

**All Métier 2 endpoints are ready for testing!** 🚀

