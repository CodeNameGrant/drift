import { useState, useEffect } from 'react';
import { Currency } from '../types';

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
];

export const useCurrency = () => {
  const getInitialCurrency = (): Currency => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      return JSON.parse(savedCurrency);
    }

    const userLocale = navigator.language;
    const currency = new Intl.NumberFormat(userLocale, { 
      style: 'currency', 
      currency: 'USD' 
    }).resolvedOptions().currency;

    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  };

  const [currency, setCurrency] = useState<Currency>(getInitialCurrency);

  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);

  return {
    currency,
    setCurrency,
    currencies: CURRENCIES
  };
};