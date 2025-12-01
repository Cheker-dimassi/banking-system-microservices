const axios = require('axios');

const DEFAULT_BASE_CURRENCY = (process.env.DEFAULT_EXCHANGE_BASE || 'USD').trim().toUpperCase();

// Currency Exchange API Configuration
const EXCHANGE_API_CONFIG = {
  EXCHANGERATE_API: {
    url: 'https://api.exchangerate-api.com/v4/latest',
    baseCurrency: DEFAULT_BASE_CURRENCY,
    free: true
  },
  FIXER_API: {
    url: 'https://api.fixer.io/latest',
    requiresKey: true,
    envKey: 'FIXER_API_KEY'
  }
};

// Fallback rates relative to DEFAULT_BASE_CURRENCY (1 unit of DEFAULT buys X units of currency)
const FALLBACK_BASE_RATES = {
  [DEFAULT_BASE_CURRENCY]: 1,
  TND: 3.2,
  EUR: 0.92,
  GBP: 0.78,
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  CAD: 1.35,
  CHF: 0.9
};

function normalizeCurrencyCode(code) {
  return (code || '').toString().trim().toUpperCase() || DEFAULT_BASE_CURRENCY;
}

function ensureBaseIncluded(rates = {}, baseCurrency) {
  if (!rates[baseCurrency]) {
    return { ...rates, [baseCurrency]: 1 };
  }
  return rates;
}

function convertRatesToNewBase(rates = {}, currentBase, targetBase) {
  const normalizedRates = ensureBaseIncluded(rates, currentBase);

  if (targetBase === currentBase) {
    return normalizedRates;
  }

  const targetRate = normalizedRates[targetBase];
  if (!targetRate) {
    return null;
  }

  const converted = {};
  Object.entries(normalizedRates).forEach(([currency, rate]) => {
    converted[currency] = rate / targetRate;
  });

  converted[targetBase] = 1;
  return converted;
}

function buildFallbackResponse(requestedBase) {
  const normalizedBase = FALLBACK_BASE_RATES[requestedBase] ? requestedBase : DEFAULT_BASE_CURRENCY;
  const convertedRates = convertRatesToNewBase(FALLBACK_BASE_RATES, DEFAULT_BASE_CURRENCY, normalizedBase);

  return {
    success: true,
    baseCurrency: normalizedBase,
    rates: convertedRates || ensureBaseIncluded(FALLBACK_BASE_RATES, normalizedBase),
    lastUpdated: new Date().toISOString(),
    source: 'Fallback (cached)',
    warning: normalizedBase !== requestedBase
      ? `Requested base ${requestedBase} not available. Using ${normalizedBase} instead.`
      : 'Using cached rates - API unavailable'
  };
}

async function tryExchangeRateAPI(baseCurrency) {
  try {
    const response = await axios.get(`${EXCHANGE_API_CONFIG.EXCHANGERATE_API.url}/${baseCurrency}`, {
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });

    if (response.data && response.data.rates) {
      const baseFromApi = normalizeCurrencyCode(response.data.base || baseCurrency);
      return {
        success: true,
        baseCurrency: baseFromApi,
        rates: convertRatesToNewBase(response.data.rates, baseFromApi, baseFromApi),
        lastUpdated: response.data.time_last_update_utc || response.data.date || new Date().toISOString(),
        source: 'ExchangeRate-API'
      };
    }
  } catch (error) {
    console.warn(`ExchangeRate-API (${baseCurrency}) failed:`, error.message);
  }

  return null;
}

async function tryFixerAPI(baseCurrency) {
  if (!process.env.FIXER_API_KEY) {
    return null;
  }

  try {
    const fixerUrl = `${EXCHANGE_API_CONFIG.FIXER_API.url}?access_key=${process.env.FIXER_API_KEY}&base=${baseCurrency}`;
    const response = await axios.get(fixerUrl, { timeout: 5000 });

    if (response.data && response.data.success && response.data.rates) {
      const baseFromApi = normalizeCurrencyCode(response.data.base || baseCurrency);
      return {
        success: true,
        baseCurrency: baseFromApi,
        rates: convertRatesToNewBase(response.data.rates, baseFromApi, baseFromApi),
        lastUpdated: response.data.date || new Date().toISOString(),
        source: 'Fixer.io'
      };
    }
  } catch (error) {
    console.warn(`Fixer.io (${baseCurrency}) failed:`, error.message);
  }

  return null;
}

function deriveResponseFromSource(sourceResult, requestedBase) {
  if (!sourceResult) {
    return null;
  }

  if (sourceResult.baseCurrency === requestedBase) {
    return sourceResult;
  }

  const convertedRates = convertRatesToNewBase(
    sourceResult.rates,
    sourceResult.baseCurrency,
    requestedBase
  );

  if (!convertedRates) {
    return null;
  }

  return {
    success: true,
    baseCurrency: requestedBase,
    rates: convertedRates,
    lastUpdated: sourceResult.lastUpdated,
    source: `${sourceResult.source} (derived)`,
    note: `Requested base ${requestedBase} derived from ${sourceResult.baseCurrency}`
  };
}

/**
 * Fetch real-time exchange rates from external API
 * @param {string} baseCurrency - Base currency (default: USD)
 * @returns {Promise<Object>} Exchange rates object
 */
async function fetchRealTimeRates(baseCurrency = DEFAULT_BASE_CURRENCY) {
  const requestedBase = normalizeCurrencyCode(baseCurrency);

  const attempts = [requestedBase];
  if (requestedBase !== DEFAULT_BASE_CURRENCY) {
    attempts.push(DEFAULT_BASE_CURRENCY);
  }

  for (const attemptBase of attempts) {
    const primary = await tryExchangeRateAPI(attemptBase) || await tryFixerAPI(attemptBase);

    if (primary) {
      const response = deriveResponseFromSource(primary, requestedBase);
      if (response) {
        return response;
      }
    }
  }

  console.warn('All currency APIs failed, using fallback rates');
  return buildFallbackResponse(requestedBase);
}

function computeCrossRate(ratePayload, fromCurrency, toCurrency) {
  if (!ratePayload || !ratePayload.rates) {
    return null;
  }

  const base = ratePayload.baseCurrency;
  const rates = ensureBaseIncluded(ratePayload.rates, base);

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    return null;
  }

  if (fromCurrency === toCurrency) {
    return 1;
  }

  if (fromCurrency === base) {
    return toRate;
  }

  if (toCurrency === base) {
    return 1 / fromRate;
  }

  return toRate / fromRate;
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<Object>} Conversion result
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const from = normalizeCurrencyCode(fromCurrency);
    const to = normalizeCurrencyCode(toCurrency);

    if (from === to) {
      return {
        success: true,
        originalAmount: parsedAmount,
        originalCurrency: from,
        convertedAmount: parsedAmount,
        targetCurrency: to,
        exchangeRate: 1,
        timestamp: new Date().toISOString()
      };
    }

    let ratesPayload = await fetchRealTimeRates(from);
    let rate = computeCrossRate(ratesPayload, from, to);

    if (!rate) {
      ratesPayload = await fetchRealTimeRates(DEFAULT_BASE_CURRENCY);
      rate = computeCrossRate(ratesPayload, from, to);
    }

    if (!rate) {
      throw new Error(`Exchange rate not available for ${from} -> ${to}`);
    }

    const convertedAmount = parseFloat((parsedAmount * rate).toFixed(2));

    return {
      success: true,
      originalAmount: parsedAmount,
      originalCurrency: from,
      convertedAmount,
      targetCurrency: to,
      exchangeRate: parseFloat(rate.toFixed(6)),
      baseCurrencyUsed: ratesPayload.baseCurrency,
      rateSource: ratesPayload.source || 'Unknown',
      timestamp: new Date().toISOString(),
      note: ratesPayload.note || ratesPayload.warning
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get supported currencies
 * @returns {Array<string>} List of supported currency codes
 */
function getSupportedCurrencies() {
  return Object.keys(FALLBACK_BASE_RATES);
}

module.exports = {
  fetchRealTimeRates,
  convertCurrency,
  getSupportedCurrencies,
  FALLBACK_RATES: FALLBACK_BASE_RATES
};

