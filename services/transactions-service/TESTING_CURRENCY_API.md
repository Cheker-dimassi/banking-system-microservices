# Testing Currency Exchange API

This guide shows you how to test the currency exchange endpoints.

## Prerequisites

1. **Install dependencies** (if not already done):
   ```bash
   cd services/transactions-service
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   # OR
   npm start
   ```

   The server should start on `http://localhost:3001`

---

## Test 1: Get Real-Time Exchange Rates

### Using Browser
Simply open:
```
http://localhost:3001/transactions/currency-rates
```

Or with a specific base currency:
```
http://localhost:3001/transactions/currency-rates?baseCurrency=USD
```

### Using cURL
```bash
# Get rates with TND as base (default)
curl http://localhost:3001/transactions/currency-rates

# Get rates with USD as base
curl "http://localhost:3001/transactions/currency-rates?baseCurrency=USD"
```

### Using Postman
1. **Method**: `GET`
2. **URL**: `http://localhost:3001/transactions/currency-rates`
3. **Query Params** (optional):
   - Key: `baseCurrency`
   - Value: `TND` (or `USD`, `EUR`, etc.)

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

**Note**: If the API is unavailable, you'll see:
```json
{
  "success": true,
  "baseCurrency": "TND",
  "rates": { ... },
  "source": "Fallback (cached)",
  "warning": "Using cached rates - API unavailable"
}
```

---

## Test 2: Convert Currency

### Using cURL
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "fromCurrency": "TND",
    "toCurrency": "USD"
  }'
```

### Using Postman
1. **Method**: `POST`
2. **URL**: `http://localhost:3001/transactions/currency/convert`
3. **Headers**:
   - `Content-Type`: `application/json`
4. **Body** (raw JSON):
   ```json
   {
     "amount": 1000,
     "fromCurrency": "TND",
     "toCurrency": "USD"
   }
   ```

### Using JavaScript (Node.js)
```javascript
const axios = require('axios');

async function testCurrencyConversion() {
  try {
    const response = await axios.post('http://localhost:3001/transactions/currency/convert', {
      amount: 1000,
      fromCurrency: 'TND',
      toCurrency: 'USD'
    });
    
    console.log('Conversion Result:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCurrencyConversion();
```

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

### Error Response (if invalid)
```json
{
  "success": false,
  "error": "Missing required fields: amount, fromCurrency, toCurrency"
}
```

---

## Test 3: Test Different Currency Pairs

### Convert TND to EUR
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "fromCurrency": "TND",
    "toCurrency": "EUR"
  }'
```

### Convert USD to TND
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "fromCurrency": "USD",
    "toCurrency": "TND"
  }'
```

### Convert EUR to GBP
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "fromCurrency": "EUR",
    "toCurrency": "GBP"
  }'
```

---

## Test 4: Error Cases

### Missing Fields
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
  }'
```
**Expected**: Error about missing fields

### Invalid Amount
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "fromCurrency": "TND",
    "toCurrency": "USD"
  }'
```
**Expected**: Error about amount being positive

### Unsupported Currency
```bash
curl -X POST http://localhost:3001/transactions/currency/convert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "fromCurrency": "TND",
    "toCurrency": "XYZ"
  }'
```
**Expected**: Error about exchange rate not available

---

## Quick Test Script

Create a file `test-currency.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCurrencyAPI() {
  console.log('🧪 Testing Currency Exchange API\n');

  // Test 1: Get exchange rates
  console.log('1️⃣  Testing GET /transactions/currency-rates');
  try {
    const rates = await axios.get(`${BASE_URL}/transactions/currency-rates`);
    console.log('✅ Success!');
    console.log('   Base Currency:', rates.data.baseCurrency);
    console.log('   Source:', rates.data.source);
    console.log('   Available Rates:', Object.keys(rates.data.rates).join(', '));
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test 2: Convert TND to USD
  console.log('2️⃣  Testing POST /transactions/currency/convert (TND → USD)');
  try {
    const conversion = await axios.post(`${BASE_URL}/transactions/currency/convert`, {
      amount: 1000,
      fromCurrency: 'TND',
      toCurrency: 'USD'
    });
    console.log('✅ Success!');
    console.log(`   ${conversion.data.originalAmount} ${conversion.data.originalCurrency} = ${conversion.data.convertedAmount} ${conversion.data.targetCurrency}`);
    console.log(`   Exchange Rate: ${conversion.data.exchangeRate}`);
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.error || error.message);
  }

  // Test 3: Convert USD to EUR
  console.log('3️⃣  Testing POST /transactions/currency/convert (USD → EUR)');
  try {
    const conversion = await axios.post(`${BASE_URL}/transactions/currency/convert`, {
      amount: 100,
      fromCurrency: 'USD',
      toCurrency: 'EUR'
    });
    console.log('✅ Success!');
    console.log(`   ${conversion.data.originalAmount} ${conversion.data.originalCurrency} = ${conversion.data.convertedAmount} ${conversion.data.targetCurrency}`);
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.response?.data?.error || error.message);
  }

  console.log('✨ Testing complete!');
}

// Run tests
testCurrencyAPI();
```

Run it:
```bash
node test-currency.js
```

---

## Troubleshooting

### Server not starting?
- Check if port 3000 is already in use
- Make sure MongoDB is running (if using MongoDB)
- Check `node_modules` are installed: `npm install`

### API returns fallback rates?
- Check your internet connection
- The ExchangeRate-API might be rate-limited
- Add a Fixer.io API key to `.env` for better reliability

### Getting CORS errors?
- Make sure you're testing from the same origin or configure CORS properly
- The server already has CORS enabled

---

## Next Steps

After testing, you can:
1. Integrate currency conversion into transaction endpoints
2. Add currency conversion fees
3. Cache exchange rates to reduce API calls
4. Add more currency pairs
5. Set up scheduled rate updates

