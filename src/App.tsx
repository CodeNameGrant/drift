import React from 'react';
import LoanCalculator from './components/LoanCalculator';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-appBackground-light dark:bg-appBackground-dark text-gray-900 dark:text-white transition-colors duration-300">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="container mx-auto py-12 px-4">
          <LoanCalculator />
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default App;