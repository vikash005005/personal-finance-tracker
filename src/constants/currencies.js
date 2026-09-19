export const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rate: 1, // base currency in demo data
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 0.012, // approx 1 INR = 0.012 USD (or ~83 INR/USD)
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.011, // approx 1 INR = 0.011 EUR
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.0095, // approx 1 INR = 0.0095 GBP
    locale: 'en-GB',
  },
};

export const formatCurrency = (amountInINR, currencyCode = 'INR') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const convertedAmount = amountInINR * currency.rate;

  if (currencyCode === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  }

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
};
