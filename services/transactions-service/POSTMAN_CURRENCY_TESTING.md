# Postman Testing Guide - Currency Exchange API

Step-by-step guide to test the currency exchange endpoints using Postman.

---

## Prerequisites

1. **Postman installed** (download from https://www.postman.com/downloads/)
2. **Server running**: 
   ```bash
   cd services/transactions-service
   npm install
   npm run dev
   ```
3. **Base URL**: `http://localhost:3001`

---

## Test 1: Get Exchange Rates

### Setup

1. **Open Postman** and create a new request
2. **Method**: Select `GET` from the dropdown
3. **URL**: Enter `http://localhost:3001/transactions/currency-rates`
4. **Headers**: No headers needed (optional)

### Optional: Add Query Parameter

To get rates with a different base currency:
- Click **Params** tab
- Add parameter:
  - **Key**: `baseCurrency`
  - **Value**: `USD` (or `EUR`, `GBP`, etc.)

### Send Request

1. Click the **Send** button
2. You should see the response in the bottom panel

### Expected Response

```json
{
  "success": true,
  "baseCurrency": "TND",
  "rates": {
    "USD": 3.12,
    "EUR": 3.41,
    "GBP": 3.88,
    "TND": 1.0,
    "SAR": 0.83,
    "AED": 0.84
  },
  "lastUpdated": "2025-01-25T10:30:00.000Z",
  "source": "ExchangeRate-API"
}
```

### Screenshot Guide

```
┌─────────────────────────────────────────┐
│ GET  http://localhost:3001/transactions │
│      /currency-rates                    │
│                                         │
│ [Params] [Authorization] [Headers]     │
│                                         │
│ [Send]                                  │
└─────────────────────────────────────────┘
```

---

## Test 2: Convert Currency

### Setup

1. **Create a new request** in Postman
2. **Method**: Select `POST` from the dropdown
3. **URL**: Enter `http://localhost:3001/transactions/currency/convert`

### Configure Headers

1. Click the **Headers** tab
2. Add header:
   - **Key**: `Content-Type`
   - **Value**: `application/json`

### Configure Body

1. Click the **Body** tab
2. Select **raw** radio button
3. Select **JSON** from the dropdown (on the right)
4. Enter this JSON:

```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

### Send Request

1. Click the **Send** button
2. Check the response

### Expected Response

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

### Screenshot Guide

```
┌─────────────────────────────────────────┐
│ POST http://localhost:3001/transactions  │
│      /currency/convert                  │
│                                         │
│ [Body] [raw] [JSON ▼]                  │
│                                         │
│ {                                       │
│   "amount": 1000,                       │
│   "fromCurrency": "TND",                │
│   "toCurrency": "USD"                  │
│ }                                       │
│                                         │
│ [Send]                                  │
└─────────────────────────────────────────┘
```

---

## Test 3: Different Currency Conversions

### TND to EUR

**Body**:
```json
{
  "amount": 5000,
  "fromCurrency": "TND",
  "toCurrency": "EUR"
}
```

### USD to TND

**Body**:
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "TND"
}
```

### EUR to GBP

**Body**:
```json
{
  "amount": 500,
  "fromCurrency": "EUR",
  "toCurrency": "GBP"
}
```

---

## Test 4: Error Cases

### Missing Fields

**Body**:
```json
{
  "amount": 1000
}
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing required fields: amount, fromCurrency, toCurrency"
}
```

### Invalid Amount

**Body**:
```json
{
  "amount": -100,
  "fromCurrency": "TND",
  "toCurrency": "USD"
}
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Amount must be a positive number"
}
```

### Unsupported Currency

**Body**:
```json
{
  "amount": 1000,
  "fromCurrency": "TND",
  "toCurrency": "XYZ"
}
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Exchange rate not available for XYZ"
}
```

---

## Postman Collection Setup

### Create a Collection

1. Click **New** → **Collection**
2. Name it: `Transaction Service - Currency API`
3. Add description: `Currency exchange endpoints testing`

### Save Requests

1. After creating a request, click **Save**
2. Select your collection
3. Name the request (e.g., "Get Exchange Rates", "Convert TND to USD")

### Environment (Optional)

1. Click **Environments** → **+**
2. Create environment:
   - **Variable**: `base_url`
   - **Initial Value**: `http://localhost:3001`
3. Use in URL: `{{base_url}}/transactions/currency-rates`

---

## Quick Test Checklist

- [ ] Server is running on port 3000
- [ ] GET `/transactions/currency-rates` returns rates
- [ ] POST `/transactions/currency/convert` converts TND to USD
- [ ] POST `/transactions/currency/convert` converts USD to EUR
- [ ] Error handling works (missing fields, invalid amount)
- [ ] Response includes `success`, `source`, and `timestamp`

---

## Troubleshooting

### "Could not get any response"
- ✅ Check if server is running: `npm run dev`
- ✅ Verify URL: `http://localhost:3001`
- ✅ Check server console for errors

### "Network Error" or "ECONNREFUSED"
- ✅ Server not started
- ✅ Wrong port (should be 3000)
- ✅ Firewall blocking connection

### "404 Not Found"
- ✅ Check URL spelling: `/transactions/currency-rates`
- ✅ Make sure server is running

### Getting fallback rates
- ✅ Check internet connection
- ✅ ExchangeRate-API might be rate-limited
- ✅ This is normal - fallback ensures the API always works

---

## Tips

1. **Save requests** to your collection for easy reuse
2. **Use variables** for base URL to switch between dev/prod
3. **Add tests** in Postman to validate responses automatically
4. **Export collection** to share with your team

---

## Example Postman Tests (Advanced)

Add these in the **Tests** tab:

```javascript
// Test 1: Status code is 200
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Response has success field
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Test 3: Rates object exists
pm.test("Rates object exists", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('rates');
    pm.expect(jsonData.rates).to.be.an('object');
});
```

---

## Ready to Test!

1. Start your server
2. Open Postman
3. Follow the steps above
4. Happy testing! 🚀

