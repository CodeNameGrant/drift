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
        {/* Navigation Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-appBackground-light/80 dark:bg-appBackground-dark/80 backdrop-blur-sm border-b border-gray-200/20 dark:border-gray-700/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CurrencyIconSelector />
              </div>
              <div className="flex items-center gap-2">
                <GitHubLink />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <section className="text-center mb-16">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Drift
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Find your drift with minimalist debt tracking and loan simulation
                </p>
              </div>
            </section>

            {/* Calculator Grid Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Calculator Form Column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      Loan Calculator
                    </h2>
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <LoanCalculator />
                </div>
              </div>

              {/* Results Column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      Results
                    </h2>
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
                      Fill out the form and click Calculate to see your loan details
                    </p>
                  </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Quick Tips
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lower interest rates and shorter terms reduce total cost
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Multi-Currency
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Switch currencies using the selector in the top navigation
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Grid */}
            <section className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Features
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Everything you need for comprehensive loan analysis
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-primary rounded"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Instant Calculations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get immediate results for monthly payments, total interest, and payoff dates
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Multiple Currencies
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Support for major world currencies with automatic locale formatting
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-primary rounded-lg"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Dark Mode
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Beautiful light and dark themes that adapt to your system preferences
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Built with React, TypeScript, and Tailwind CSS
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CurrencyProvider>
  );
}

export default App;