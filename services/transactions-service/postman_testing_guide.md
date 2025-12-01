# Postman Testing Guide for Transaction Service

This guide provides example requests to test the Transaction Service API using Postman.

**Base URL**: `http://localhost:3001`
**Headers**:
- `Content-Type`: `application/json`

## Prerequisites
1. Ensure the server is running:
   ```bash
   npm run dev
   # OR
   node server.js
   ```
2. Available Test Accounts:
   - `ACC_123` (Balance: ~5000 TND)
   - `ACC_456` (Balance: ~3000 TND)

---

## 1. Core Transactions (Métier 1)

### Make a Deposit
**Endpoint**: `POST /transactions/deposit`
**Body**:
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 100,
  "currency": "TND",
  "description": "Salary deposit"
}
```

### Make a Withdrawal
**Endpoint**: `POST /transactions/withdrawal`
**Body**:
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 50,
  "currency": "TND",
  "description": "ATM Withdrawal"
}
```

### Internal Transfer
**Endpoint**: `POST /transactions/internal-transfer`
**Body**:
```json
{
  "type": "internal_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "ACC_456",
  "amount": 200,
  "currency": "TND",
  "description": "Rent share"
}
```

### Interbank Transfer
**Endpoint**: `POST /transactions/interbank-transfer`
**Body**:
```json
{
  "type": "interbank_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "EXT_999",
  "amount": 300,
  "currency": "TND",
  "description": "Payment to other bank"
}
```

### Get Transactions for Account
**Endpoint**: `GET /transactions/account/ACC_123`

### Get Transaction by ID
**Endpoint**: `GET /transactions/:transactionId`
*(Replace `:transactionId` with an ID returned from one of the POST requests above)*

---

## 2. Security & Limits (Métier 2)

### Check Account Limits
**Endpoint**: `GET /transactions/limits/ACC_123`

### Fraud Check (Simulation)
**Endpoint**: `POST /transactions/fraud-check`
**Body**:
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 15000,
  "currency": "TND"
}
```
*(This should trigger a fraud flag due to high amount)*

### Reverse a Transaction
**Endpoint**: `POST /transactions/:transactionId/reverse`
*(Replace `:transactionId` with a completed transaction ID)*

---

## 3. Fees & Commissions (Métier 3)

### Calculate Fees (Simulation)
**Endpoint**: `POST /transactions/fees/calculate`
**Body**:
```json
{
  "type": "interbank_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "EXT_999",
  "amount": 1000
}
```

### Get Commissions
**Endpoint**: `GET /transactions/commissions/all`

### Get Currency Exchange Rates
**Endpoint**: `GET /transactions/currency-rates`

**Optional Query Parameter**:
- `baseCurrency`: `USD`, `EUR`, `GBP`, etc. (default: `TND`)

**Example**: `GET /transactions/currency-rates?baseCurrency=USD`

**Response**:
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

### Convert Currency
**Endpoint**: `POST /transactions/currency/convert`

**Body**:
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

**Response**:
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
