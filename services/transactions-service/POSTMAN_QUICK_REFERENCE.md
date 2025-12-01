# Postman Quick Reference - All Endpoints

**Base URL**: `http://localhost:3001`

---

## 🎯 MÉTIER 1: Core Transaction Processing

| # | Method | Endpoint | Full URL |
|---|--------|----------|----------|
| 1 | POST | `/transactions/deposit` | `http://localhost:3001/transactions/deposit` |
| 2 | POST | `/transactions/withdrawal` | `http://localhost:3001/transactions/withdrawal` |
| 3 | POST | `/transactions/internal-transfer` | `http://localhost:3001/transactions/internal-transfer` |
| 4 | POST | `/transactions/interbank-transfer` | `http://localhost:3001/transactions/interbank-transfer` |
| 5 | GET | `/transactions/{id}` | `http://localhost:3001/transactions/TXN-12345` |
| 6 | GET | `/transactions/account/{accountId}` | `http://localhost:3001/transactions/account/ACC_123` |
| 7 | DELETE | `/transactions/{id}` | `http://localhost:3001/transactions/TXN-12345` |

---

## 🔒 MÉTIER 2: Security & Limits Management

| # | Method | Endpoint | Full URL |
|---|--------|----------|----------|
| 8 | GET | `/transactions/limits/{accountId}` | `http://localhost:3001/transactions/limits/ACC_123` |
| 9 | PUT | `/transactions/limits/{accountId}` | `http://localhost:3001/transactions/limits/ACC_123` |
| 10 | POST | `/transactions/fraud-check` | `http://localhost:3001/transactions/fraud-check` |
| 11 | POST | `/transactions/{id}/reverse` | `http://localhost:3001/transactions/TXN-12345/reverse` |
| 12 | GET | `/transactions/suspicious/{accountId}` | `http://localhost:3001/transactions/suspicious/ACC_123` |

---

## 💰 MÉTIER 3: Fees & Commission System

| # | Method | Endpoint | Full URL |
|---|--------|----------|----------|
| 13 | POST | `/transactions/fees/calculate` | `http://localhost:3001/transactions/fees/calculate` |
| 14 | GET | `/transactions/commissions/{period}` | `http://localhost:3001/transactions/commissions/all` |
| 15 | POST | `/transactions/fee-waiver/{accountId}` | `http://localhost:3001/transactions/fee-waiver/ACC_123` |
| 16 | GET | `/transactions/currency-rates` | `http://localhost:3001/transactions/currency-rates` |
| 17 | POST | `/transactions/currency/convert` | `http://localhost:3001/transactions/currency/convert` |

---

## 🏥 Utility Endpoints

| # | Method | Endpoint | Full URL |
|---|--------|----------|----------|
| 18 | GET | `/health` | `http://localhost:3001/health` |
| 19 | GET | `/` | `http://localhost:3001/` |

---

## 📋 Test Accounts

- **ACC_123**: Balance 5500 TND, Active
- **ACC_456**: Balance 3000 TND, Active

---

## 🔑 Common Headers

```
Content-Type: application/json
```

---

## 📝 Quick Test Bodies

### Deposit
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 1000,
  "currency": "TND",
  "description": "Test deposit"
}
```

### Withdrawal
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 500,
  "currency": "TND",
  "description": "Test withdrawal"
}
```

### Internal Transfer
```json
{
  "type": "internal_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "ACC_456",
  "amount": 200,
  "currency": "TND",
  "description": "Test transfer"
}
```

### Currency Convert
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

---

**Copy-paste ready!** 🚀

