# How to Reverse a Transaction

## Step-by-Step Guide

### Step 1: Create a Transaction First

You need a **completed** transaction to reverse it.

**Example: Create a Deposit**
```
POST http://localhost:3001/transactions/deposit
Body:
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 1000,
  "currency": "TND",
  "description": "Test deposit for reversal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit completed successfully",
  "transaction": {
    "transactionId": "TXN_A1B2C3D4",  ← COPY THIS!
    "type": "deposit",
    "amount": 1000,
    "status": "completed",
    "toAccount": "ACC_123",
    ...
  }
}
```

### Step 2: Copy the transactionId

From the response above, copy the `transactionId`:
- Example: `TXN_A1B2C3D4`

### Step 3: Reverse the Transaction

**Request:**
```
POST http://localhost:3001/transactions/TXN_A1B2C3D4/reverse
```

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction reversed successfully",
  "originalTransaction": {
    "transactionId": "TXN_A1B2C3D4",
    "type": "deposit",
    "amount": 1000,
    "status": "reversed",
    "toAccount": "ACC_123"
  },
  "reversalTransaction": {
    "transactionId": "TXN_E5F6G7H8",
    "type": "deposit",
    "amount": 1000,
    "status": "completed",
    "fromAccount": "ACC_123",
    "description": "Reversal of TXN_A1B2C3D4"
  }
}
```

---

## Alternative: List All Transactions First

If you don't have the transactionId, list all transactions:

**Request:**
```
GET http://localhost:3001/transactions
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "transactions": [
    {
      "transactionId": "TXN_A1B2C3D4",
      "type": "deposit",
      "amount": 1000,
      "status": "completed"
    },
    {
      "transactionId": "TXN_E5F6G7H8",
      "type": "withdrawal",
      "amount": 500,
      "status": "completed"
    }
  ]
}
```

Then use any `transactionId` with status `"completed"` to reverse it.

---

## Important Rules

### ✅ Can Reverse:
- ✅ **Completed** transactions only
- ✅ Any transaction type (deposit, withdrawal, transfer)

### ❌ Cannot Reverse:
- ❌ **Pending** transactions
- ❌ **Failed** transactions
- ❌ **Already reversed** transactions
- ❌ Transactions that don't exist

---

## Common Errors

### 1. "Transaction not found"

**Error:**
```json
{
  "success": false,
  "error": "Transaction not found: TXN_XXXXX",
  "hint": "List all transactions with GET /transactions to see available transactionIds"
}
```

**Solutions:**
- ✅ Make sure you're using the correct `transactionId` format: `TXN_XXXXXXXX`
- ✅ List all transactions: `GET /transactions` to see available IDs
- ✅ Check if the transaction exists: `GET /transactions/{transactionId}`
- ❌ Don't use MongoDB `_id` - use `transactionId` instead

### 2. "Only completed transactions can be reversed"

**Error:**
```json
{
  "success": false,
  "error": "Only completed transactions can be reversed. Current status: pending"
}
```

**Solution:**
- ✅ Wait for the transaction to complete
- ✅ Check transaction status: `GET /transactions/{transactionId}`
- ✅ Only reverse transactions with `"status": "completed"`

### 3. "Transaction already reversed"

**Error:**
```json
{
  "success": false,
  "error": "Transaction already reversed"
}
```

**Solution:**
- ✅ This transaction was already reversed
- ✅ Check the transaction status: `GET /transactions/{transactionId}`
- ✅ Use a different transaction that hasn't been reversed

---

## Complete Test Flow

### 1. Create a Transaction
```
POST /transactions/deposit
Body: { "type": "deposit", "toAccount": "ACC_123", "amount": 1000 }
```

### 2. Copy transactionId from Response
```
"transactionId": "TXN_A1B2C3D4"
```

### 3. Verify Transaction Status
```
GET /transactions/TXN_A1B2C3D4
```
Should show: `"status": "completed"`

### 4. Reverse the Transaction
```
POST /transactions/TXN_A1B2C3D4/reverse
```

### 5. Verify Reversal
```
GET /transactions/TXN_A1B2C3D4
```
Should show: `"status": "reversed"`

---

## Postman Setup

### Environment Variables:
```
base_url = http://localhost:3001
transaction_id = TXN_A1B2C3D4
```

### Request:
```
POST {{base_url}}/transactions/{{transaction_id}}/reverse
```

### Auto-Save transactionId (Postman Tests Tab):
```javascript
// After creating a transaction
if (pm.response.code === 201) {
  const transactionId = pm.response.json().transaction.transactionId;
  pm.environment.set("transaction_id", transactionId);
  console.log("Saved transactionId:", transactionId);
}
```

---

## What Happens When You Reverse?

1. **Original Transaction:**
   - Status changes from `"completed"` → `"reversed"`
   - Remains in database for audit trail

2. **Reversal Transaction:**
   - New transaction is created
   - Reverses the money flow (opposite direction)
   - Status: `"completed"`
   - Description: `"Reversal of {originalTransactionId}"`

**Example:**
- **Original:** Deposit 1000 TND to ACC_123
- **Reversal:** Withdrawal 1000 TND from ACC_123

---

## Quick Reference

| Action | Endpoint | Method |
|--------|----------|--------|
| Create Transaction | `/transactions/deposit` | POST |
| List All Transactions | `/transactions` | GET |
| Get Transaction by ID | `/transactions/{id}` | GET |
| Reverse Transaction | `/transactions/{id}/reverse` | POST |

---

## Troubleshooting Checklist

- [ ] Transaction exists? → `GET /transactions/{id}`
- [ ] Transaction status is "completed"? → Check response
- [ ] Using correct transactionId format? → `TXN_XXXXXXXX`
- [ ] Transaction not already reversed? → Check status
- [ ] Server running? → `GET /health`
- [ ] MongoDB connected? → Check server logs

---

**Now you can successfully reverse transactions!** 🚀

