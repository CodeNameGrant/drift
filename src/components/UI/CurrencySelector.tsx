import React, { memo } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

/**
 * Currency selector dropdown component
 * Allows users to select their preferred currency for display
 */
const CurrencySelector: React.FC = memo(() => {
  const { currency, setCurrency, currencies } = useCurrency();

  /**
   * Handle currency selection change
   */
  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencies.find(c => c.code === event.target.value);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  return (
    <select
      value={currency.code}
      onChange={handleCurrencyChange}
      className="block rounded-lg py-2 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 transition duration-200"
      aria-label="Select currency"
    >
      {currencies.map(c => (
        <option key={c.code} value={c.code}>
          {c.symbol} - {c.name}
        </option>
      ))}
    </select>
  );
});

CurrencySelector.displayName = 'CurrencySelector';

export default CurrencySelector;