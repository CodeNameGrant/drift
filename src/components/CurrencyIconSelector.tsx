import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencyIconSelector: React.FC = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencySelect = (selectedCurrency: typeof currency) => {
    setCurrency(selectedCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-gray-700"
        aria-label="Select currency"
        title={`Current currency: ${currency.name}`}
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[24px] text-center">
          {currency.symbol}
        </span>
        <ChevronDown 
          className={`h-3 w-3 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 flex items-center justify-between ${
                  curr.code === currency.code
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="font-semibold min-w-[24px]">{curr.symbol}</span>
                  <span>{curr.name}</span>
                </span>
                {curr.code === currency.code && (
                  <span className="text-xs opacity-75">{curr.code}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyIconSelector;