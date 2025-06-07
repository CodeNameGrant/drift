import React from 'react';
import LoanCalculator from './components/LoanCalculator';
import ThemeToggle from './components/ThemeToggle';
import GitHubLink from './components/GitHubLink';
import CurrencyIconSelector from './components/CurrencyIconSelector';
import { useTheme } from './hooks/useTheme';
import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-appBackground-light dark:bg-appBackground-dark text-gray-900 dark:text-white transition-colors duration-300">
        <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
          <CurrencyIconSelector />
          <GitHubLink />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        <div className="container mx-auto py-12 px-4">
          <LoanCalculator />
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default App;