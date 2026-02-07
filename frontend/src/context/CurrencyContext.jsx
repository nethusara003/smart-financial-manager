import React, { createContext, useContext, useState, useEffect } from 'react';

// Currency definitions with symbols and exchange rates (base: LKR = 1)
export const CURRENCIES = {
  LKR: {
    code: 'LKR',
    name: 'Sri Lankan Rupee',
    symbol: 'Rs.',
    flag: '🇱🇰',
    rate: 1, // Base currency
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    rate: 0.0031, // 1 LKR = 0.0031 USD (approximate)
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    rate: 0.0028, // 1 LKR = 0.0028 EUR (approximate)
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    rate: 0.0024, // 1 LKR = 0.0024 GBP (approximate)
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    rate: 0.26, // 1 LKR = 0.26 INR (approximate)
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    rate: 0.0047, // 1 LKR = 0.0047 AUD (approximate)
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    rate: 0.0042, // 1 LKR = 0.0042 CAD (approximate)
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    rate: 0.0041, // 1 LKR = 0.0041 SGD (approximate)
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    rate: 0.46, // 1 LKR = 0.46 JPY (approximate)
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    flag: '🇨🇳',
    rate: 0.022, // 1 LKR = 0.022 CNY (approximate)
  },
};

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('LKR');
  const [showCurrencySymbol, setShowCurrencySymbol] = useState(true);

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    const savedShowSymbol = localStorage.getItem('showCurrencySymbol');
    
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrentCurrency(savedCurrency);
    }
    
    if (savedShowSymbol !== null) {
      setShowCurrencySymbol(savedShowSymbol === 'true');
    }
  }, []);

  // Save currency preference to localStorage
  const changeCurrency = (currencyCode) => {
    if (CURRENCIES[currencyCode]) {
      setCurrentCurrency(currencyCode);
      localStorage.setItem('currency', currencyCode);
    }
  };

  const toggleCurrencySymbol = () => {
    const newValue = !showCurrencySymbol;
    setShowCurrencySymbol(newValue);
    localStorage.setItem('showCurrencySymbol', newValue.toString());
  };

  // Convert amount from LKR to current currency
  const convertFromLKR = (amount) => {
    const numAmount = Number(amount) || 0;
    return numAmount * CURRENCIES[currentCurrency].rate;
  };

  // Convert amount from current currency to LKR
  const convertToLKR = (amount) => {
    const numAmount = Number(amount) || 0;
    return numAmount / CURRENCIES[currentCurrency].rate;
  };

  // Format amount with current currency
  const formatCurrency = (amount, options = {}) => {
    const {
      decimals = 2,
      showSymbol = showCurrencySymbol,
      showCode = false,
    } = options;

    const convertedAmount = convertFromLKR(amount);
    const currency = CURRENCIES[currentCurrency];
    
    // Format with locale
    const formattedAmount = convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    let result = formattedAmount;
    
    if (showSymbol) {
      result = `${currency.symbol} ${formattedAmount}`;
    }
    
    if (showCode) {
      result = `${result} ${currency.code}`;
    }

    return result;
  };

  // Get compact format (e.g., $1.2K, $1.5M)
  const formatCompact = (amount) => {
    const converted = convertFromLKR(amount);
    const currency = CURRENCIES[currentCurrency];
    
    const absAmount = Math.abs(converted);
    let formatted;
    
    if (absAmount >= 1000000) {
      formatted = (converted / 1000000).toFixed(1) + 'M';
    } else if (absAmount >= 1000) {
      formatted = (converted / 1000).toFixed(1) + 'K';
    } else {
      formatted = converted.toFixed(0);
    }
    
    return showCurrencySymbol ? `${currency.symbol}${formatted}` : formatted;
  };

  const value = {
    currentCurrency,
    currencies: CURRENCIES,
    currency: CURRENCIES[currentCurrency],
    changeCurrency,
    convertFromLKR,
    convertToLKR,
    formatCurrency,
    formatCompact,
    showCurrencySymbol,
    toggleCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
