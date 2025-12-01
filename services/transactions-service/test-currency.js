const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCurrencyAPI() {
  console.log('🧪 Testing Currency Exchange API\n');
  console.log('Make sure the server is running on http://localhost:3001\n');

  // Test 1: Get exchange rates
  console.log('1️⃣  Testing GET /transactions/currency-rates');
  try {
    const rates = await axios.get(`${BASE_URL}/transactions/currency-rates`);
    console.log('✅ Success!');
    console.log('   Base Currency:', rates.data.baseCurrency);
    console.log('   Source:', rates.data.source);
    console.log('   Available Rates:', Object.keys(rates.data.rates).join(', '));
    if (rates.data.warning) {
      console.log('   ⚠️  Warning:', rates.data.warning);
    }
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Make sure the server is running!');
    }
    console.log('');
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
    console.log('');
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
    console.log('');
  }

  // Test 4: Error case - missing fields
  console.log('4️⃣  Testing error handling (missing fields)');
  try {
    await axios.post(`${BASE_URL}/transactions/currency/convert`, {
      amount: 1000
    });
    console.log('❌ Should have failed!');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid request');
      console.log('   Error:', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
    console.log('');
  }

  console.log('✨ Testing complete!');
}

// Run tests
testCurrencyAPI().catch(console.error);

