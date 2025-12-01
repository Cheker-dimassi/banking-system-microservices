# 🚀 Complete Postman Testing Guide - Port 3001

**Base URL**: `http://localhost:3001`  
**Server**: Make sure it's running on port 3001

---

## ✅ Quick Start

1. **Start Server**: `npm run dev` (should be on port 3001)
2. **Open Postman**
3. **Test Health**: `GET http://localhost:3001/health`
4. **Start Testing!**

---

## 🎯 MÉTIER 1: Core Transaction Processing

### 1. Make a Deposit
**POST** `http://localhost:3001/transactions/deposit`
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 1000,
  "currency": "TND",
  "description": "Salary deposit"
}
```

### 2. Make a Withdrawal
**POST** `http://localhost:3001/transactions/withdrawal`
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 500,
  "currency": "TND",
  "description": "ATM withdrawal"
}
```

### 3. Internal Transfer
**POST** `http://localhost:3001/transactions/internal-transfer`
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

### 4. Interbank Transfer
**POST** `http://localhost:3001/transactions/interbank-transfer`
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

### 5. Get Transaction by ID
**GET** `http://localhost:3001/transactions/{transactionId}`  
Example: `http://localhost:3001/transactions/TXN-12345`

### 6. Get All Transactions for Account
**GET** `http://localhost:3001/transactions/account/ACC_123`

### 7. Delete Transaction
**DELETE** `http://localhost:3001/transactions/{transactionId}`  
Example: `http://localhost:3001/transactions/TXN-12345`

---

## 🔒 MÉTIER 2: Security & Limits Management

### 8. Get Account Limits
**GET** `http://localhost:3001/transactions/limits/ACC_123`

### 9. Update Account Limits
**PUT** `http://localhost:3001/transactions/limits/ACC_123`
```json
{
  "dailyWithdrawal": 10000,
  "dailyTransfer": 20000,
  "singleTransaction": 5000
}
```

### 10. Fraud Check
**POST** `http://localhost:3001/transactions/fraud-check`
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 15000,
  "currency": "TND"
}
```

### 11. Reverse Transaction
**POST** `http://localhost:3001/transactions/{transactionId}/reverse`  
Example: `http://localhost:3001/transactions/TXN-12345/reverse`

### 12. Get Suspicious Transactions
**GET** `http://localhost:3001/transactions/suspicious/ACC_123`

---

## 💰 MÉTIER 3: Fees & Commission System

### 13. Calculate Fees
**POST** `http://localhost:3001/transactions/fees/calculate`
```json
{
  "type": "interbank_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "EXT_999",
  "amount": 1000
}
```

### 14. Get Commissions
**GET** `http://localhost:3001/transactions/commissions/{period}`

Examples:
- `http://localhost:3001/transactions/commissions/all`
- `http://localhost:3001/transactions/commissions/daily`
- `http://localhost:3001/transactions/commissions/monthly`
- `http://localhost:3001/transactions/commissions/2024-01`

### 15. Apply Fee Waiver
**POST** `http://localhost:3001/transactions/fee-waiver/ACC_123`

### 16. Get Currency Exchange Rates
**GET** `http://localhost:3001/transactions/currency-rates`

Optional: `http://localhost:3001/transactions/currency-rates?baseCurrency=USD`

### 17. Convert Currency
**POST** `http://localhost:3001/transactions/currency/convert`
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

More Examples:
- TND to EUR: `{"amount": 5000, "fromCurrency": "TND", "toCurrency": "EUR"}`
- USD to TND: `{"amount": 100, "fromCurrency": "USD", "toCurrency": "TND"}`

---

## 🏥 Utility Endpoints

### 18. Health Check
**GET** `http://localhost:3001/health`

### 19. API Documentation
**GET** `http://localhost:3001/`

---

## 📋 Test Accounts

- **ACC_123**: Balance 5500 TND, Active
- **ACC_456**: Balance 3000 TND, Active

---

## 🔑 Required Headers

For POST/PUT requests:
```
Content-Type: application/json
```

---

## ✅ Testing Checklist

### Métier 1 (7 endpoints)
- [ ] Deposit
- [ ] Withdrawal
- [ ] Internal Transfer
- [ ] Interbank Transfer
- [ ] Get Transaction by ID
- [ ] Get Account Transactions
- [ ] Delete Transaction

### Métier 2 (5 endpoints)
- [ ] Get Account Limits
- [ ] Update Account Limits
- [ ] Fraud Check
- [ ] Reverse Transaction
- [ ] Get Suspicious Transactions

### Métier 3 (5 endpoints)
- [ ] Calculate Fees
- [ ] Get Commissions (all periods)
- [ ] Apply Fee Waiver
- [ ] Get Currency Rates
- [ ] Convert Currency

### Utility (2 endpoints)
- [ ] Health Check
- [ ] API Documentation

---

## 🚀 Recommended Test Order

1. **Health Check** → Verify server
2. **Get Limits** → Check ACC_123
3. **Make Deposit** → Add money
4. **Internal Transfer** → Move money
5. **Get Transactions** → Verify
6. **Calculate Fees** → Test fees
7. **Get Currency Rates** → Test currency API
8. **Convert Currency** → Test conversion

---

## 🐛 Troubleshooting

- **"Could not get any response"** → Check if server is running on port 3001
- **"404 Not Found"** → Verify URL spelling
- **"400 Bad Request"** → Check JSON format and required fields
- **"500 Internal Server Error"** → Check server console

---

**All URLs are ready to copy-paste!** 🎉

