import React from 'react';
import { useCurrency } from '../hooks/useCurrency';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <select
      value={currency.code}
      onChange={(e) => {
        const selected = currencies.find(c => c.code === e.target.value);
        if (selected) setCurrency(selected);
      }}
      className="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white transition-colors duration-300"
    >
      {currencies.map(c => (
        <option key={c.code} value={c.code}>
          {c.code} ({c.symbol})
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;