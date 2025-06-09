import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import type { Currency } from '../types';
import { useLocalStorage } from '../hooks';
import { SUPPORTED_CURRENCIES, STORAGE_KEYS } from '../utils/constants';

interface CurrencyContextType {
  /** Currently selected currency */
  currency: Currency;
  /** Function to update the selected currency */
  setCurrency: (currency: Currency) => void;
  /** Array of all supported currencies */
  currencies: readonly Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/**
 * Hook to access currency context
 * @throws Error if used outside of CurrencyProvider
 */
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

/**
 * Get default currency based on user's locale or fallback to USD
 */
const getDefaultCurrency = (): Currency => {
  const userLocale = navigator.language;
  const currencyByLocale: Record<string, string> = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'en-CA': 'CAD',
    'en-NZ': 'NZD',
    'ja-JP': 'JPY',
    'de-CH': 'CHF',
    'en-ZA': 'ZAR',
  };

  const currencyCode = currencyByLocale[userLocale] || 'USD';
  return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
};

interface CurrencyProviderProps {
  children: ReactNode;
}

/**
 * Currency context provider component
 * Manages currency selection with localStorage persistence
 */
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useLocalStorage<Currency>(
    STORAGE_KEYS.CURRENCY,
    getDefaultCurrency()
  );

  const contextValue: CurrencyContextType = {
    currency,
    setCurrency,
    currencies: SUPPORTED_CURRENCIES
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};