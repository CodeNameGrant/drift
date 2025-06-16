import React from 'react';
import { Check } from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyDropdownPanelProps {
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencySelect: (currency: Currency) => void;
  onClose: () => void;
}

/**
 * Currency dropdown panel component for mobile-friendly currency selection
 * Features smooth animations, keyboard navigation, and accessibility
 */
const CurrencyDropdownPanel: React.FC<CurrencyDropdownPanelProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  onClose
}) => {
  /**
   * Handle currency selection and close panel
   */
  const handleCurrencySelect = (currency: Currency) => {
    onCurrencySelect(currency);
    onClose();
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, currency: Currency) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCurrencySelect(currency);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Select Currency
        </h3>
      </div>

      {/* Currency List */}
      <div className="max-h-64 overflow-y-auto">
        {currencies.map((currency) => {
          const isSelected = currency.code === selectedCurrency.code;
          
          return (
            <button
              key={currency.code}
              onClick={() => handleCurrencySelect(currency)}
              onKeyDown={(e) => handleKeyDown(e, currency)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                isSelected ? 'bg-primary/10 dark:bg-primary/20' : ''
              }`}
              role="option"
              aria-selected={isSelected}
              data-testid={`currency-option-${currency.code}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {currency.symbol}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {currency.code}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {currency.name}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary dark:text-primary-light" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Currency affects display formatting only
        </p>
      </div>
    </div>
  );
};

export default CurrencyDropdownPanel;