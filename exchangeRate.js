const axios = require('axios');
const Settings = require('./Settings');

// Cache for exchange rate
let exchangeRateCache = {
  rate: null,
  lastUpdated: null,
  cacheDuration: 5 * 60 * 1000 // 5 minutes default
};

// Get USD to Toman exchange rate
const getExchangeRate = async () => {
  try {
    const cacheDuration = await Settings.getValue('exchange_rate_cache_duration', 300) * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Check if cache is still valid
    if (exchangeRateCache.rate && 
        exchangeRateCache.lastUpdated && 
        (now - exchangeRateCache.lastUpdated) < cacheDuration) {
      return exchangeRateCache.rate;
    }

    // Fetch new rate
    const apiKey = await Settings.getValue('exchange_rate_api_key');
    const apiUrl = await Settings.getValue('exchange_rate_api_url', 'https://api.exchangerate-api.com/v4/latest/USD');
    
    let rate = null;

    if (apiKey && apiUrl.includes('exchangerate-api.com')) {
      // Use ExchangeRate-API with API key
      const response = await axios.get(`${apiUrl}?access_key=${apiKey}`, {
        timeout: 10000
      });
      
      if (response.data && response.data.rates && response.data.rates.IRR) {
        rate = response.data.rates.IRR;
      }
    } else if (apiUrl) {
      // Try without API key (free tier)
      const response = await axios.get(apiUrl, {
        timeout: 10000
      });
      
      if (response.data && response.data.rates && response.data.rates.IRR) {
        rate = response.data.rates.IRR;
      }
    }

    // Fallback to alternative APIs if primary fails
    if (!rate) {
      rate = await getFallbackExchangeRate();
    }

    // If still no rate, use a default rate (this should be updated regularly)
    if (!rate) {
      console.warn('Unable to fetch exchange rate, using default rate');
      rate = 42000; // Default fallback rate - should be updated
    }

    // Update cache
    exchangeRateCache = {
      rate: rate,
      lastUpdated: now,
      cacheDuration: cacheDuration
    };

    console.log(`Exchange rate updated: 1 USD = ${rate} IRR`);
    return rate;

  } catch (error) {
    console.error('Error fetching exchange rate:', error.message);
    
    // Return cached rate if available
    if (exchangeRateCache.rate) {
      console.log('Using cached exchange rate due to fetch error');
      return exchangeRateCache.rate;
    }
    
    // Return default rate as last resort
    console.warn('Using default exchange rate due to fetch error');
    return 42000; // Default fallback rate
  }
};

// Fallback exchange rate sources
const getFallbackExchangeRate = async () => {
  const fallbackAPIs = [
    'https://api.fixer.io/latest?base=USD&symbols=IRR',
    'https://api.currencylayer.com/live?access_key=YOUR_KEY&currencies=IRR&source=USD',
    'https://free.currconv.com/api/v7/convert?q=USD_IRR&compact=ultra'
  ];

  for (const apiUrl of fallbackAPIs) {
    try {
      const response = await axios.get(apiUrl, { timeout: 5000 });
      
      // Handle different API response formats
      if (response.data.rates && response.data.rates.IRR) {
        return response.data.rates.IRR;
      }
      if (response.data.quotes && response.data.quotes.USDIRR) {
        return response.data.quotes.USDIRR;
      }
      if (response.data.USD_IRR) {
        return response.data.USD_IRR;
      }
    } catch (error) {
      console.log(`Fallback API failed: ${apiUrl}`);
      continue;
    }
  }
  
  return null;
};

// Convert USD to Toman
const convertUSDToToman = async (usdAmount) => {
  const rate = await getExchangeRate();
  return Math.ceil(usdAmount * rate);
};

// Convert Toman to USD
const convertTomanToUSD = async (tomanAmount) => {
  const rate = await getExchangeRate();
  return tomanAmount / rate;
};

// Get cached exchange rate info
const getExchangeRateInfo = () => {
  return {
    rate: exchangeRateCache.rate,
    lastUpdated: exchangeRateCache.lastUpdated,
    isStale: exchangeRateCache.lastUpdated ? 
      (Date.now() - exchangeRateCache.lastUpdated) > exchangeRateCache.cacheDuration : 
      true
  };
};

// Force refresh exchange rate
const refreshExchangeRate = async () => {
  exchangeRateCache.lastUpdated = null; // Force refresh
  return await getExchangeRate();
};

// Format currency
const formatCurrency = (amount, currency = 'IRR') => {
  if (currency === 'IRR' || currency === 'Toman') {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } else if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  return amount.toString();
};

module.exports = {
  getExchangeRate,
  convertUSDToToman,
  convertTomanToUSD,
  getExchangeRateInfo,
  refreshExchangeRate,
  formatCurrency
};

