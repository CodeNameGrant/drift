import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import CurrencyDropdownPanel from './CurrencyDropdownPanel';

/**
 * Responsive currency selector component with dropdown panel
 * Features mobile-friendly design, click-outside-to-close, and keyboard navigation
 */
const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Toggle dropdown panel visibility
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Close dropdown panel
   */
  const closeDropdown = () => {
    setIsOpen(false);
  };

  /**
   * Handle currency selection
   */
  const handleCurrencySelect = (selectedCurrency: typeof currency) => {
    setCurrency(selectedCurrency);
    closeDropdown();
  };

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /**
   * Handle keyboard navigation for button
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm font-medium text-gray-900 dark:text-white shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current currency: ${currency.name}. Click to change currency.`}
        data-testid="currency-selector-button"
      >
        {/* Globe icon for mobile, currency symbol for larger screens */}
        <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 sm:hidden" />
        <span className="hidden sm:inline text-base font-semibold">
          {currency.symbol}
        </span>
        
        {/* Currency code - always visible */}
        <span className="text-sm font-medium">
          {currency.code}
        </span>
        
        {/* Chevron indicator */}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <CurrencyDropdownPanel
          currencies={currencies}
          selectedCurrency={currency}
          onCurrencySelect={handleCurrencySelect}
          onClose={closeDropdown}
        />
      )}
    </div>
  );
};

export default CurrencySelector;