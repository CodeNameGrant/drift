import React from 'react';
import LoanCalculator from './components/LoanCalculator';
import ThemeToggle from './components/ThemeToggle';
import CurrencySelector from './components/CurrencySelector';
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-appBackground-light dark:bg-appBackground-dark text-gray-900 dark:text-white transition-colors duration-300">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <CurrencySelector />
      <div className="container mx-auto py-12 px-4">
        <LoanCalculator />
      </div>
    </div>
  );
}