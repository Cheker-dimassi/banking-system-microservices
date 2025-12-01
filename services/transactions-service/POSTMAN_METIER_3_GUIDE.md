# Postman Testing Guide: Métier 3 - Fees & Commissions

Complete testing guide for all Fees & Commission System endpoints.

**Base URL:** `http://localhost:3001`

---

## 📁 Métier 3: Fees & Commission System

### 1. Calculate Fees

**Purpose:** Calculate transaction fees and commissions before executing a transaction.

**Request:**
```
POST http://localhost:3001/transactions/fees/calculate
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**

**Example 1: Deposit (No Fees)**
```json
{
  "type": "deposit",
  "toAccount": "ACC_123",
  "amount": 1000,
  "currency": "TND"
}
```

**Example 2: Withdrawal**
```json
{
  "type": "withdrawal",
  "fromAccount": "ACC_123",
  "amount": 500,
  "currency": "TND"
}
```

**Example 3: Internal Transfer**
```json
{
  "type": "internal_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "ACC_456",
  "amount": 1000,
  "currency": "TND"
}
```

**Example 4: Interbank Transfer**
```json
{
  "type": "interbank_transfer",
  "fromAccount": "ACC_123",
  "toAccount": "EXT_999",
  "amount": 2000,
  "currency": "TND"
}
```

**Expected Response (200 OK):**

**Deposit:**
```json
{
  "success": true,
  "calculation": {
    "type": "deposit",
    "amount": 1000,
    "fees": 0,
    "commission": 0,
    "total": 1000
  }
}
```

**Withdrawal:**
```json
{
  "success": true,
  "calculation": {
    "type": "withdrawal",
    "amount": 500,
    "fees": 0,
    "commission": 0,
    "total": 500
  }
}
```

**Internal Transfer:**
```json
{
  "success": true,
  "calculation": {
    "type": "internal_transfer",
    "amount": 1000,
    "fees": 5,
    "commission": 2.5,
    "total": 1005
  }
}
```

**Interbank Transfer:**
```json
{
  "success": true,
  "calculation": {
    "type": "interbank_transfer",
    "amount": 2000,
    "fees": 40,
    "commission": 20,
    "total": 2040
  }
}
```

**Fee Structure:**
- **Deposit:** 0 TND (no fees)
- **Withdrawal:** 0 TND (same bank)
- **Internal Transfer:** 0.5% of amount (commission = 50% of fees)
- **Interbank Transfer:** 2% of amount (commission = 50% of fees)

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/fees/calculate`
3. Body → raw → JSON

---

### 2. Get Commissions

**Purpose:** Get total commissions earned for a specific period.

**Request:**
```
GET http://localhost:3001/transactions/commissions/all
GET http://localhost:3001/transactions/commissions/daily
GET http://localhost:3001/transactions/commissions/monthly
GET http://localhost:3001/transactions/commissions/2024-01
```

**Headers:**
```
Content-Type: application/json
```

**No Body Required**

**Period Options:**
- `all` - All time
- `daily` - Today
- `monthly` - Current month
- `YYYY-MM` - Specific month (e.g., `2024-01`)

**Expected Response (200 OK):**
```json
{
  "success": true,
  "period": "all",
  "totalCommission": 125.50,
  "transactionCount": 5,
  "transactions": [
    {
      "transactionId": "TXN_A1B2C3D4",
      "type": "internal_transfer",
      "amount": 1000,
      "commission": 2.5,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "transactionId": "TXN_E5F6G7H8",
      "type": "interbank_transfer",
      "amount": 2000,
      "commission": 20,
      "timestamp": "2024-01-15T11:45:00.000Z"
    }
  ]
}
```

**Test Cases:**
- ✅ Get all commissions: `/commissions/all`
- ✅ Get today's commissions: `/commissions/daily`
- ✅ Get this month's commissions: `/commissions/monthly`
- ✅ Get specific month: `/commissions/2024-01`

**Note:** Only transactions with `commission > 0` are included. Deposits and withdrawals have 0 commission.

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/commissions/{{period}}`
3. Use environment variable: `period = all` or `daily` or `monthly`

---

### 3. Fee Waiver

**Purpose:** Apply fee waiver to an account (simulated - for demo purposes).

**Request:**
```
POST http://localhost:3001/transactions/fee-waiver/ACC_123
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
  "message": "Fee waiver applied (simulated)",
  "accountId": "ACC_123",
  "waivedFees": [
    "INTERNAL_TRANSFER",
    "WITHDRAWAL"
  ]
}
```

**Test Cases:**
- ✅ Valid account: `ACC_123`, `ACC_456`, `EXT_999`
- ❌ Invalid account: `ACC_999` → `404 Account not found`

**Note:** This is a simulated endpoint. In a real system, this would update fee waiver rules in the database.

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/fee-waiver/{{account_id}}`
3. Use environment variable: `account_id = ACC_123`

---

## 📁 Currency Exchange (Subfolder)

### 4. Get Exchange Rates

**Purpose:** Get real-time currency exchange rates from external APIs.

**Request:**
```
GET http://localhost:3001/transactions/currency-rates
GET http://localhost:3001/transactions/currency-rates?baseCurrency=USD
GET http://localhost:3001/transactions/currency-rates?baseCurrency=EUR
```

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `baseCurrency` (optional): Base currency code (default: `TND`)
  - Supported: `TND`, `USD`, `EUR`, `GBP`, `SAR`, `AED`

**No Body Required**

**Expected Response (200 OK):**
```json
{
  "success": true,
  "baseCurrency": "TND",
  "rates": {
    "TND": 1,
    "USD": 0.3226,
    "EUR": 0.2941,
    "GBP": 0.2564,
    "SAR": 0.1205,
    "AED": 0.1190
  },
  "lastUpdated": "2024-01-15T12:00:00.000Z",
  "source": "ExchangeRate-API"
}
```

**Response with Fallback (if API fails):**
```json
{
  "success": true,
  "baseCurrency": "TND",
  "rates": {
    "TND": 1.0,
    "USD": 3.1,
    "EUR": 3.4,
    "GBP": 3.9,
    "SAR": 0.83,
    "AED": 0.84
  },
  "lastUpdated": "2024-01-15T12:00:00.000Z",
  "source": "Fallback (cached)",
  "warning": "Using cached rates - API unavailable"
}
```

**Test Cases:**
- ✅ Default (TND): `/currency-rates`
- ✅ USD base: `/currency-rates?baseCurrency=USD`
- ✅ EUR base: `/currency-rates?baseCurrency=EUR`
- ✅ Invalid currency: Uses fallback rates

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3001/transactions/currency-rates`
3. Optional: Add query parameter `?baseCurrency=USD`

---

### 5. Convert Currency (TND → USD)

**Purpose:** Convert amount from TND (Tunisian Dinar) to USD (US Dollar).

**Request:**
```
POST http://localhost:3001/transactions/currency/convert
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "originalAmount": 1000,
  "originalCurrency": "TND",
  "convertedAmount": 322.58,
  "targetCurrency": "USD",
  "exchangeRate": 0.3226,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/currency/convert`
3. Body → raw → JSON

---

### 6. Convert Currency (TND → EUR)

**Purpose:** Convert amount from TND (Tunisian Dinar) to EUR (Euro).

**Request:**
```
POST http://localhost:3001/transactions/currency/convert
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "EUR"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "originalAmount": 1000,
  "originalCurrency": "TND",
  "convertedAmount": 294.12,
  "targetCurrency": "EUR",
  "exchangeRate": 0.2941,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/currency/convert`
3. Body → raw → JSON

---

### 7. Convert Currency (USD → TND)

**Purpose:** Convert amount from USD (US Dollar) to TND (Tunisian Dinar).

**Request:**
```
POST http://localhost:3001/transactions/currency/convert
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "TND"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "originalAmount": 100,
  "originalCurrency": "USD",
  "convertedAmount": 310,
  "targetCurrency": "TND",
  "exchangeRate": 3.1,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3001/transactions/currency/convert`
3. Body → raw → JSON

---

## Currency Conversion Examples

### All Supported Conversions

**TND → USD:**
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

**TND → EUR:**
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "EUR"
}
```

**TND → GBP:**
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "GBP"
}
```

**USD → TND:**
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "TND"
}
```

**EUR → TND:**
```json
{
  "amount": 100,
  "fromCurrency": "EUR",
  "toCurrency": "TND"
}
```

**USD → EUR:**
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "EUR"
}
```

---

## Supported Currencies

- **TND** - Tunisian Dinar (Base currency)
- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **SAR** - Saudi Riyal
- **AED** - UAE Dirham

---

## Error Responses

### 400 - Missing Required Fields
```json
{
  "success": false,
  "error": "Missing required fields: amount, fromCurrency, toCurrency"
}
```

### 400 - Invalid Amount
```json
{
  "success": false,
  "error": "Amount must be a positive number"
}
```

### 400 - Exchange Rate Not Available
```json
{
  "success": false,
  "error": "Exchange rate not available for XXX"
}
```

### 404 - Account Not Found
```json
{
  "success": false,
  "error": "Account not found"
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

## Complete Test Flow for Métier 3

### Step-by-Step Testing:

**1. Calculate Fees for Different Transaction Types**
```
POST /transactions/fees/calculate
Body: { "type": "internal_transfer", "amount": 1000, ... }
```
✅ Check fees calculation

**2. Create Transactions with Fees**
```
POST /transactions/internal-transfer
Body: { "fromAccount": "ACC_123", "toAccount": "ACC_456", "amount": 1000 }
```
✅ Creates transaction with commission

**3. Get Commissions**
```
GET /transactions/commissions/all
```
✅ See total commissions earned

**4. Get Exchange Rates**
```
GET /transactions/currency-rates
```
✅ Get current exchange rates

**5. Convert Currency**
```
POST /transactions/currency/convert
Body: { "amount": 1000, "fromCurrency": "TND", "toCurrency": "USD" }
```
✅ Convert between currencies

**6. Apply Fee Waiver**
```
POST /transactions/fee-waiver/ACC_123
```
✅ Apply fee waiver to account

---

## Postman Environment Variables

Create these variables in your Postman environment:

```
base_url = http://localhost:3001
account_id = ACC_123
period = all
```

**Use in requests:**
- `{{base_url}}/transactions/fees/calculate`
- `{{base_url}}/transactions/commissions/{{period}}`
- `{{base_url}}/transactions/fee-waiver/{{account_id}}`
- `{{base_url}}/transactions/currency-rates`
- `{{base_url}}/transactions/currency/convert`

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/transactions/fees/calculate` | POST | Calculate fees |
| `/transactions/commissions/:period` | GET | Get commissions |
| `/transactions/fee-waiver/:accountId` | POST | Apply fee waiver |
| `/transactions/currency-rates` | GET | Get exchange rates |
| `/transactions/currency/convert` | POST | Convert currency |

---

## Testing Checklist

- [ ] Calculate fees for deposit (should be 0)
- [ ] Calculate fees for withdrawal (should be 0)
- [ ] Calculate fees for internal transfer (0.5% of amount)
- [ ] Calculate fees for interbank transfer (2% of amount)
- [ ] Create internal transfer transaction
- [ ] Get all commissions
- [ ] Get daily commissions
- [ ] Get monthly commissions
- [ ] Get exchange rates (default TND)
- [ ] Get exchange rates (USD base)
- [ ] Get exchange rates (EUR base)
- [ ] Convert TND to USD
- [ ] Convert TND to EUR
- [ ] Convert USD to TND
- [ ] Convert EUR to TND
- [ ] Apply fee waiver to account
- [ ] Test with invalid account (should return 404)
- [ ] Test with invalid currency (should use fallback)

---

## Currency Exchange API Details

### Data Sources (in order of priority):

1. **ExchangeRate-API** (Free tier: 1500 requests/month)
   - No API key required
   - Real-time rates
   - URL: `https://api.exchangerate-api.com/v4/latest/{baseCurrency}`

2. **Fixer.io** (Requires API key)
   - More reliable
   - Requires `FIXER_API_KEY` in `.env`
   - URL: `https://api.fixer.io/latest?access_key={key}&base={baseCurrency}`

3. **Fallback Rates** (If APIs fail)
   - Hardcoded rates
   - Used when external APIs are unavailable
   - Shows warning in response

### Setting Up API Keys (Optional):

Add to `.env` file:
```env
FIXER_API_KEY=your_api_key_here
EXCHANGE_RATE_API_KEY=your_api_key_here
```

---

**All Métier 3 endpoints are ready for testing!** 🚀

