import React from 'react';
import LoanCalculator from './components/LoanCalculator';
import ThemeToggle from './components/ThemeToggle';
import CurrencySelector from './components/CurrencySelector';
import { useTheme } from './hooks/useTheme';
import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-appBackground-light dark:bg-appBackground-dark text-gray-900 dark:text-white transition-colors duration-300">
        <div className="fixed top-5 left-5 z-50">
          <CurrencySelector />
        </div>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="container mx-auto py-12 px-4">
          <LoanCalculator />
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default App;