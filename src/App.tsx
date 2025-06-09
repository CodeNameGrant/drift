import React from 'react';
import { LoanCalculator, ThemeToggle, GitHubLink, CurrencySelector } from './components';
import { useTheme } from './hooks';
import { CurrencyProvider } from './context/CurrencyContext';

/**
 * Main application component
 * Sets up providers, theme management, and global layout
 */
function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-appBackground-light dark:bg-appBackground-dark text-gray-900 dark:text-white transition-colors duration-300">
        {/* Fixed UI Elements */}
        <div className="fixed top-5 left-5 z-50">
          <CurrencySelector />
        </div>
        <GitHubLink />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        
        {/* Main Content */}
        <div className="container mx-auto py-12 px-4">
          <LoanCalculator />
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default App;