import { useState, useEffect, useCallback } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "دولار أمريكي", rate: 1 },
  { code: "SAR", symbol: "ر.س", name: "ريال سعودي", rate: 3.75 },
  { code: "AED", symbol: "د.إ", name: "درهم إماراتي", rate: 3.67 },
  { code: "EGP", symbol: "ج.م", name: "جنيه مصري", rate: 50.85 },
  { code: "KWD", symbol: "د.ك", name: "دينار كويتي", rate: 0.31 },
];

const STORAGE_KEY = "preferred_currency";

export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = currencies.find(c => c.code === saved);
      if (found) return found;
    }
    return currencies[0];
  });

  // Listen for changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = currencies.find(c => c.code === saved);
        if (found && found.code !== selectedCurrency.code) {
          setSelectedCurrencyState(found);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes from same tab
    const interval = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = currencies.find(c => c.code === saved);
        if (found && found.code !== selectedCurrency.code) {
          setSelectedCurrencyState(found);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCurrency.code]);

  const setSelectedCurrency = useCallback((currency: Currency) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem(STORAGE_KEY, currency.code);
  }, []);

  const convert = useCallback((amountInUSD: number): number => {
    return amountInUSD * selectedCurrency.rate;
  }, [selectedCurrency.rate]);

  const format = useCallback((amountInUSD: number): string => {
    const converted = convert(amountInUSD);
    return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
  }, [convert, selectedCurrency.symbol]);

  return {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    convert,
    format,
  };
};
