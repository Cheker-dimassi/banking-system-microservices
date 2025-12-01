# How to Get Transaction ID for Testing

## Problem
When you create a transaction (deposit, withdrawal, transfer), you need the `transactionId` to:
- Get transaction details: `GET /transactions/{transactionId}`
- Delete transaction: `DELETE /transactions/{transactionId}`
- Reverse transaction: `POST /transactions/{transactionId}/reverse`

## Solution: Get Transaction ID from Response

### Step 1: Create a Transaction

**POST** `http://localhost:3001/transactions/deposit`
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 1000,
  "currency": "TND",
  "description": "Test deposit"
}
```

### Step 2: Copy the transactionId from Response

**Response:**
```json
{
  "success": true,
  "message": "Deposit completed successfully",
  "transaction": {
    "transactionId": "TXN_A1B2C3D4",  ← Copy this!
    "type": "deposit",
    "amount": 1000,
    "status": "completed",
    ...
  }
}
```

### Step 3: Use the transactionId

**Get Transaction:**
```
GET http://localhost:3001/transactions/TXN_A1B2C3D4
```

**Delete Transaction:**
```
DELETE http://localhost:3001/transactions/TXN_A1B2C3D4
```

---

## Alternative: List All Transactions

### Get All Transactions
**GET** `http://localhost:3001/transactions`

**Response:**
```json
{
  "success": true,
  "count": 5,
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

### Get Transactions by Account
**GET** `http://localhost:3001/transactions/account/ACC_123`

**Response:**
```json
{
  "success": true,
  "accountId": "ACC_123",
  "count": 3,
  "transactions": [
    {
      "transactionId": "TXN_A1B2C3D4",
      "type": "deposit",
      "amount": 1000
    }
  ]
}
```

---

## Transaction ID Format

Transaction IDs are generated in this format:
- Format: `TXN_XXXXXXXX`
- Example: `TXN_A1B2C3D4`
- Example: `TXN_12345678`

**Important:** Use the full `transactionId`, not the MongoDB `_id`.

---

## Quick Test Flow

1. **Create Deposit:**
   ```
   POST http://localhost:3001/transactions/deposit
   Body: { "type": "deposit", "toAccount": "ACC_123", "amount": 1000, "currency": "TND" }
   ```

2. **Copy transactionId from response:**
   ```
   "transactionId": "TXN_A1B2C3D4"
   ```

3. **Get Transaction:**
   ```
   GET http://localhost:3001/transactions/TXN_A1B2C3D4
   ```

4. **Delete Transaction:**
   ```
   DELETE http://localhost:3001/transactions/TXN_A1B2C3D4
   ```

---

## Troubleshooting

### "Transaction not found"

**Possible causes:**
1. ❌ Wrong transactionId format
   - ✅ Use: `TXN_A1B2C3D4`
   - ❌ Don't use: MongoDB `_id` or partial ID

2. ❌ Transaction doesn't exist
   - ✅ List all transactions first: `GET /transactions`
   - ✅ Check account transactions: `GET /transactions/account/ACC_123`

3. ❌ Typo in transactionId
   - ✅ Copy-paste from response instead of typing

---

## Pro Tip

**In Postman:**
1. Create a transaction
2. In the response, right-click on `transactionId`
3. Select "Copy Value"
4. Use it in your next request

**Or use Postman Variables:**
1. Create transaction
2. In Tests tab, add:
   ```javascript
   pm.environment.set("transactionId", pm.response.json().transaction.transactionId);
   ```
3. Use in URL: `{{transactionId}}`

---

**Now you can easily get and delete transactions!** 🚀

