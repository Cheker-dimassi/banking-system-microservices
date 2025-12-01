# Complete Postman Testing Guide - All Métiers

**Base URL**: `http://localhost:3001`  
**Server Status**: Make sure server is running (`npm run dev`)

---

## 📋 Quick Setup Checklist

- [x] Server running on port 3000
- [x] Postman installed
- [x] Test accounts available (see below)

**Test Accounts**:
- `ACC_123` (Balance: ~5000 TND)
- `ACC_456` (Balance: ~3000 TND)

---

## 🎯 MÉTIER 1: Core Transaction Processing

### 1. Make a Deposit

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/deposit`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 1000,
  "currency": "TND",
  "description": "Salary deposit"
}
```

**Expected Response**: 201 Created
```json
{
  "success": true,
  "message": "Deposit completed successfully",
  "transaction": {
    "transactionId": "...",
    "type": "deposit",
    "amount": 1000,
    "status": "completed"
  }
}
```

---

### 2. Make a Withdrawal

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/withdrawal`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 500,
  "currency": "TND",
  "description": "ATM withdrawal"
}
```

**Expected Response**: 201 Created

---

### 3. Internal Transfer (Same Bank)

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/internal-transfer`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "internal_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "ACC_456",
  "amount": 200,
  "currency": "TND",
  "description": "Payment to friend"
}
```

**Expected Response**: 201 Created

---

### 4. Interbank Transfer (Different Bank)

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/interbank-transfer`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "interbank_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "EXT_999",
  "amount": 300,
  "currency": "TND",
  "description": "Payment to external bank"
}
```

**Expected Response**: 201 Created

---

### 5. Get Transaction by ID

**Method**: `GET`  
**URL**: `http://localhost:3001/transactions/{transactionId}`

**Example**: `http://localhost:3001/transactions/TXN-12345`

**Note**: Replace `{transactionId}` with an actual transaction ID from a previous request.

**Expected Response**: 200 OK
```json
{
  "success": true,
  "transaction": {
    "transactionId": "TXN-12345",
    "type": "deposit",
    "amount": 1000,
    "status": "completed"
  }
}
```

---

### 6. Get All Transactions for an Account

**Method**: `GET`  
**URL**: `http://localhost:3001/transactions/account/{accountId}`

**Example**: `http://localhost:3001/transactions/account/ACC_123`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "accountId": "ACC_123",
  "count": 5,
  "transactions": [...]
}
```

---

### 7. Delete a Transaction

**Method**: `DELETE`  
**URL**: `http://localhost:3001/transactions/{transactionId}`

**Example**: `http://localhost:3001/transactions/TXN-12345`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## 🔒 MÉTIER 2: Security & Limits Management

### 8. Get Account Limits

**Method**: `GET`  
**URL**: `http://localhost:3001/transactions/limits/{accountId}`

**Example**: `http://localhost:3001/transactions/limits/ACC_123`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "accountId": "ACC_123",
  "limits": {
    "dailyWithdrawal": {
      "used": 2000,
      "limit": 5000,
      "remaining": 3000
    },
    "dailyTransfer": {
      "used": 5000,
      "limit": 10000,
      "remaining": 5000
    },
    "singleTransaction": 2000,
    "minTransaction": 1
  }
}
```

---

### 9. Update Account Limits

**Method**: `PUT`  
**URL**: `http://localhost:3001/transactions/limits/{accountId}`

**Example**: `http://localhost:3001/transactions/limits/ACC_123`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "dailyWithdrawal": 10000,
  "dailyTransfer": 20000,
  "singleTransaction": 5000
}
```

**Expected Response**: 200 OK
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

---

### 10. Fraud Check

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/fraud-check`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 15000,
  "currency": "TND"
}
```

**Expected Response**: 200 OK
```json
{
  "success": true,
  "fraudCheck": {
    "isFraud": true,
    "flags": ["High amount", "Unusual time"],
    "securityLevel": "high"
  }
}
```

---

### 11. Reverse a Transaction

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/{transactionId}/reverse`

**Example**: `http://localhost:3001/transactions/TXN-12345/reverse`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "message": "Transaction reversed successfully",
  "originalTransaction": {...},
  "reversalTransaction": {...}
}
```

---

### 12. Get Suspicious Transactions

**Method**: `GET`  
**URL**: `http://localhost:3001/transactions/suspicious/{accountId}`

**Example**: `http://localhost:3001/transactions/suspicious/ACC_123`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "accountId": "ACC_123",
  "count": 2,
  "transactions": [...]
}
```

---

## 💰 MÉTIER 3: Fees & Commission System

### 13. Calculate Fees

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/fees/calculate`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "interbank_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "EXT_999",
  "amount": 1000
}
```

**Expected Response**: 200 OK
```json
{
  "success": true,
  "calculation": {
    "type": "interbank_transfer",
    "amount": 1000,
    "fees": 20.00,
    "commission": 10.00,
    "total": 1020.00
  }
}
```

---

### 14. Get Commissions

**Method**: `GET`  
**URL**: `http://localhost:3001/transactions/commissions/{period}`

**Examples**:
- `http://localhost:3001/transactions/commissions/all` (all time)
- `http://localhost:3001/transactions/commissions/daily` (today)
- `http://localhost:3001/transactions/commissions/monthly` (this month)
- `http://localhost:3001/transactions/commissions/2024-01` (specific month)

**Expected Response**: 200 OK
```json
{
  "success": true,
  "period": "all",
  "totalCommission": 150.50,
  "transactionCount": 25,
  "transactions": [...]
}
```

---

### 15. Apply Fee Waiver

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/fee-waiver/{accountId}`

**Example**: `http://localhost:3001/transactions/fee-waiver/ACC_123`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "message": "Fee waiver applied (simulated)",
  "accountId": "ACC_123",
  "waivedFees": ["INTERNAL_TRANSFER", "WITHDRAWAL"]
}
```

---

### 16. Get Currency Exchange Rates

**Method**: `GET`  
**URL**: `http://localhost:3001/transactions/currency-rates`

**Optional Query Parameter**:
- `baseCurrency`: `USD`, `EUR`, `GBP` (default: `TND`)

**Example**: `http://localhost:3001/transactions/currency-rates?baseCurrency=USD`

**Expected Response**: 200 OK
```json
{
  "success": true,
  "baseCurrency": "TND",
  "rates": {
    "USD": 3.12,
    "EUR": 3.41,
    "GBP": 3.88,
    "TND": 1.0
  },
  "lastUpdated": "2025-01-25T10:30:00.000Z",
  "source": "ExchangeRate-API"
}
```

---

### 17. Convert Currency

**Method**: `POST`  
**URL**: `http://localhost:3001/transactions/currency/convert`  
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

**Expected Response**: 200 OK
```json
{
  "success": true,
  "originalAmount": 1000,
  "originalCurrency": "TND",
  "convertedAmount": 320.51,
  "targetCurrency": "USD",
  "exchangeRate": 0.32051,
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

**More Examples**:

Convert TND to EUR:
```json
{
  "amount": 5000,
  "fromCurrency": "TND",
  "toCurrency": "EUR"
}
```

Convert USD to TND:
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "TND"
}
```

---

## 🏥 Utility Endpoints

### 18. Health Check

**Method**: `GET`  
**URL**: `http://localhost:3001/health`

**Expected Response**: 200 OK
```json
{
  "status": "healthy",
  "service": "Transaction Service",
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

---

### 19. API Documentation

**Method**: `GET`  
**URL**: `http://localhost:3001/`

**Expected Response**: 200 OK
```json
{
  "service": "Transaction Management Microservice",
  "developer": "Chaker Allah Dimassi",
  "team": "TechWin",
  "version": "1.0.0",
  "endpoints": {...}
}
```

---

## 📝 Postman Collection Setup

### Step 1: Create Collection
1. Open Postman
2. Click **New** → **Collection**
3. Name: `Transaction Service - Complete API`

### Step 2: Create Folders
Create these folders:
- `Métier 1: Core Transactions`
- `Métier 2: Security & Limits`
- `Métier 3: Fees & Commissions`
- `Utility`

### Step 3: Add Environment Variable
1. Click **Environments** → **+**
2. Create: `Transaction Service - Local`
3. Add variable:
   - **Variable**: `base_url`
   - **Initial Value**: `http://localhost:3001`
4. Use in requests: `{{base_url}}/transactions/deposit`

### Step 4: Save All Requests
For each endpoint above:
1. Create request
2. Configure method, URL, headers, body
3. Save to appropriate folder
4. Use `{{base_url}}` variable in URLs

---

## ✅ Testing Checklist

### Métier 1 (Core Transactions)
- [ ] Deposit money
- [ ] Withdraw money
- [ ] Internal transfer
- [ ] Interbank transfer
- [ ] Get transaction by ID
- [ ] Get account transactions
- [ ] Delete transaction

### Métier 2 (Security & Limits)
- [ ] Get account limits
- [ ] Update account limits
- [ ] Fraud check
- [ ] Reverse transaction
- [ ] Get suspicious transactions

### Métier 3 (Fees & Commissions)
- [ ] Calculate fees
- [ ] Get commissions (all periods)
- [ ] Apply fee waiver
- [ ] Get currency rates
- [ ] Convert currency (multiple pairs)

### Utility
- [ ] Health check
- [ ] API documentation

---

## 🐛 Common Issues

### "Could not get any response"
- ✅ Check if server is running: `npm run dev`
- ✅ Verify URL: `http://localhost:3001`
- ✅ Check server console for errors

### "404 Not Found"
- ✅ Check URL spelling
- ✅ Make sure route exists in routes/transactions.js

### "400 Bad Request"
- ✅ Check request body format (must be valid JSON)
- ✅ Verify all required fields are present
- ✅ Check account IDs exist

### "500 Internal Server Error"
- ✅ Check server console for error details
- ✅ Verify data files exist (accounts.json, etc.)

---

## 🚀 Quick Test Sequence

Test in this order for best results:

1. **Health Check** → Verify server is running
2. **Get Account Limits** → Check ACC_123 limits
3. **Make Deposit** → Add money to ACC_123
4. **Internal Transfer** → Transfer from ACC_123 to ACC_456
5. **Get Transactions** → Verify transfer was recorded
6. **Calculate Fees** → Check fee calculation
7. **Get Currency Rates** → Test currency API
8. **Convert Currency** → Test conversion

---

## 📊 Expected Results Summary

- **Métier 1**: All transactions should complete successfully
- **Métier 2**: Limits should be enforced, fraud should be detected
- **Métier 3**: Fees should calculate correctly, rates should be real-time

**Happy Testing!** 🎉

