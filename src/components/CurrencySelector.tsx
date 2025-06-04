import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <select
      value={currency.code}
      onChange={(e) => {
        const selected = currencies.find(c => c.code === e.target.value);
        if (selected) setCurrency(selected);
      }}
      className="block rounded-lg py-2 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 transition duration-200"
    >
      {currencies.map(c => (
        <option key={c.code} value={c.code}>
          {c.symbol} - {c.name}
        </option>
      ))}
    </select>
  );
};