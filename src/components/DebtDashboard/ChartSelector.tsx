import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, PieChart, TrendingDown, BarChart3 } from 'lucide-react';

export interface ChartOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ChartSelectorProps {
  options: ChartOption[];
  selectedChart: string;
  onChartChange: (chartId: string) => void;
}

/**
 * Chart selector dropdown component for switching between different visualizations
 * Features smooth animations, keyboard navigation, and accessibility
 */
const ChartSelector: React.FC<ChartSelectorProps> = ({ 
  options, 
  selectedChart, 
  onChartChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.id === selectedChart) || options[0];

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Close dropdown
   */
  const closeDropdown = () => {
    setIsOpen(false);
  };

  /**
   * Handle chart selection
   */
  const handleChartSelect = (chartId: string) => {
    onChartChange(chartId);
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

  /**
   * Handle option keyboard navigation
   */
  const handleOptionKeyDown = (e: React.KeyboardEvent, chartId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChartSelect(chartId);
    } else if (e.key === 'Escape') {
      closeDropdown();
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Selector Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-between w-full min-w-[280px] px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current chart: ${selectedOption.label}. Click to change chart.`}
        data-testid="chart-selector-button"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <selectedOption.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedOption.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedOption.description}
            </div>
          </div>
        </div>
        
        {/* Chevron indicator */}
        <div className="ml-2">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Select Visualization
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose which chart to display
            </p>
          </div>

          {/* Options List */}
          <div className="py-2" role="listbox">
            {options.map((option) => {
              const isSelected = option.id === selectedChart;
              const Icon = option.icon;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleChartSelect(option.id)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                    isSelected ? 'bg-primary/10 dark:bg-primary/20' : ''
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  data-testid={`chart-option-${option.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-primary/20 dark:bg-primary/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isSelected 
                          ? 'text-primary dark:text-primary-light' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        isSelected 
                          ? 'text-primary dark:text-primary-light' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Each chart provides different insights into your debt portfolio
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartSelector;