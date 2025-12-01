# Postman Collection Organization Guide

## Recommended Structure: Single Collection with Folders

### Option 1: Organized by Métiers (Recommended) ✅

```
📁 Transaction Service API
  ├── 📁 Métier 1: Core Transactions
  │   ├── Deposit
  │   ├── Withdrawal
  │   ├── Internal Transfer
  │   ├── Interbank Transfer
  │   ├── Get Transaction by ID
  │   └── Get Transactions by Account
  │
  ├── 📁 Métier 2: Security & Limits
  │   ├── GET Account Limits
  │   │   └── URL: {{base_url}}/transactions/limits/{{account_id}}
  │   │
  │   ├── PUT Update Account Limits
  │   │   └── URL: {{base_url}}/transactions/limits/{{account_id}}
  │   │   └── Body: { "dailyWithdrawal": 10000, "dailyTransfer": 20000 }
  │   │
  │   ├── POST Fraud Check
  │   │   └── URL: {{base_url}}/transactions/fraud-check
  │   │   └── Body: { "type": "withdrawal", "fromAccount": "ACC_123", "amount": 15000 }
  │   │
  │   ├── POST Reverse Transaction
  │   │   └── URL: {{base_url}}/transactions/{{transaction_id}}/reverse
  │   │
  │   └── GET Suspicious Transactions
  │       └── URL: {{base_url}}/transactions/suspicious/{{account_id}}
  │
  ├── 📁 Métier 3: Fees & Commissions
  │   ├── POST Calculate Fees
  │   │   └── URL: {{base_url}}/transactions/fees/calculate
  │   │   └── Body: { "type": "internal_transfer", "amount": 1000, ... }
  │   │
  │   ├── GET Get Commissions
  │   │   └── URL: {{base_url}}/transactions/commissions/{{period}}
  │   │   └── Periods: all, daily, monthly, YYYY-MM
  │   │
  │   ├── POST Fee Waiver
  │   │   └── URL: {{base_url}}/transactions/fee-waiver/{{account_id}}
  │   │
  │   └── 📁 Currency Exchange
  │       ├── GET Get Exchange Rates
  │       │   └── URL: {{base_url}}/transactions/currency-rates
  │       │   └── Query: ?baseCurrency=USD (optional)
  │       │
  │       ├── POST Convert Currency (TND → USD)
  │       │   └── URL: {{base_url}}/transactions/currency/convert
  │       │   └── Body: { "amount": 1000, "fromCurrency": "TND", "toCurrency": "USD" }
  │       │
  │       ├── POST Convert Currency (TND → EUR)
  │       │   └── URL: {{base_url}}/transactions/currency/convert
  │       │   └── Body: { "amount": 1000, "fromCurrency": "TND", "toCurrency": "EUR" }
  │       │
  │       └── POST Convert Currency (USD → TND)
  │           └── URL: {{base_url}}/transactions/currency/convert
  │           └── Body: { "amount": 100, "fromCurrency": "USD", "toCurrency": "TND" }
  │
  └── 📁 Utility
      └── Health Check
```

**Why this is better:**
- ✅ All endpoints in one place
- ✅ Easy to see relationships between endpoints
- ✅ Can use shared variables (base URL, auth tokens)
- ✅ Better for team collaboration
- ✅ Currency is logically grouped with other Métier 3 features

---

## Alternative: Separate Collection (If Needed)

### Option 2: Separate Currency Collection

```
📁 Transaction Service - Core
  └── (All transaction endpoints)

📁 Currency Exchange API
  ├── Get Exchange Rates
  ├── Convert Currency
  └── (Currency-specific endpoints)
```

**Use this if:**
- ✅ You want to share currency API separately
- ✅ Currency API is used by multiple services
- ✅ You need different authentication for currency endpoints
- ✅ Currency API has different base URL

---

## How to Set Up in Postman

### Step 1: Create Main Collection

1. Click **New** → **Collection**
2. Name: `Transaction Service API`
3. Description: `Complete API for banking transaction microservice`

### Step 2: Create Folders

1. Right-click collection → **Add Folder**
2. Create folders:
   - `Métier 1: Core Transactions`
   - `Métier 2: Security & Limits`
   - `Métier 3: Fees & Commissions`
   - `Métier 4: Reports & Analytics`
   - `Utility`

### Step 3: Add Currency Subfolder

1. Right-click `Métier 3: Fees & Commissions` folder
2. **Add Folder** → Name: `Currency Exchange`

### Step 4: Add Requests to Currency Folder

1. Create request: `Get Exchange Rates`
2. Drag it into `Currency Exchange` folder
3. Create request: `Convert Currency`
4. Drag it into `Currency Exchange` folder

### Step 5: Set Up Environment Variables

1. Create **Environment**: `Transaction Service - Local`
2. Add variables:
   ```
   base_url = http://localhost:3001
   account_id = ACC_123
   ```
3. Use in requests: `{{base_url}}/transactions/currency-rates`

---

## Collection Structure Example

```
Transaction Service API
│
├── Variables (Collection Level)
│   ├── base_url = http://localhost:3001
│   └── auth_token = (if needed)
│
├── Métier 1: Core Transactions
│   ├── POST Deposit
│   ├── POST Withdrawal
│   ├── POST Internal Transfer
│   └── ...
│
├── Métier 2: Security & Limits
│   ├── GET Account Limits
│   ├── POST Fraud Check
│   └── ...
│
├── Métier 3: Fees & Commissions
│   ├── POST Calculate Fees
│   ├── GET Commissions
│   ├── POST Fee Waiver
│   │
│   └── Currency Exchange (Subfolder)
│       ├── GET Exchange Rates
│       │   └── URL: {{base_url}}/transactions/currency-rates
│       │
│       ├── POST Convert TND to USD
│       │   └── Body: { "amount": 1000, "fromCurrency": "TND", "toCurrency": "USD" }
│       │
│       ├── POST Convert TND to EUR
│       │   └── Body: { "amount": 1000, "fromCurrency": "TND", "toCurrency": "EUR" }
│       │
│       └── POST Convert USD to TND
│           └── Body: { "amount": 100, "fromCurrency": "USD", "toCurrency": "TND" }
│
├── Métier 4: Reports & Analytics
│   ├── GET Overall Summary
│   │   └── URL: {{base_url}}/transactions/reports/summary
│   │   └── Query: ?startDate=2024-01-01&endDate=2024-12-31
│   │
│   ├── GET Account Statistics
│   │   └── URL: {{base_url}}/transactions/reports/account/{{account_id}}
│   │   └── Query: ?startDate=2024-01-01&endDate=2024-12-31
│   │
│   ├── GET Monthly Statistics
│   │   └── URL: {{base_url}}/transactions/reports/monthly
│   │   └── Query: ?year=2024&month=1
│   │
│   └── GET Transaction Trends
│       └── URL: {{base_url}}/transactions/reports/trends
│       └── Query: ?period=30&type=deposit
│
└── Utility
    └── GET Health Check
```

---

## Best Practices

### ✅ DO:
- Use folders to organize by métiers
- Use subfolders for related endpoints (like Currency)
- Set up environment variables for base URL
- Add descriptions to requests
- Use consistent naming: `GET Exchange Rates`, `POST Convert Currency`
- Save example responses in request examples

### ❌ DON'T:
- Create too many separate collections (harder to manage)
- Mix unrelated endpoints in same folder
- Hardcode URLs (use variables instead)
- Forget to add descriptions

---

## My Recommendation

**Use Option 1: Single Collection with Folders** ✅

**Reasoning:**
1. **Logical grouping**: Currency is part of Métier 3 (Fees & Commissions)
2. **Easier maintenance**: One collection to update
3. **Shared variables**: Same base URL, auth tokens
4. **Better for team**: Everyone uses same structure
5. **Subfolder is enough**: Currency endpoints are clearly separated

**Only use separate collection if:**
- Currency API is used by multiple microservices
- You need to share it independently
- It has different authentication/URL

---

## Quick Setup Checklist

- [ ] Create main collection: `Transaction Service API`
- [ ] Create folders for each métier (1, 2, 3, 4)
- [ ] Create `Currency Exchange` subfolder in Métier 3
- [ ] Add currency requests to subfolder
- [ ] Add reports requests to Métier 4 folder
- [ ] Set up environment variables
- [ ] Add descriptions to requests
- [ ] Export collection to share with team

---

## Export & Share

Once organized:
1. Right-click collection → **Export**
2. Choose format: `Collection v2.1`
3. Share with team or commit to repository

This way everyone has the same organized structure! 🚀

