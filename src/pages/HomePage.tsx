import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, PiggyBank, Clock, ArrowRight, CheckCircle } from 'lucide-react';

/**
 * Home page component showcasing the Drift loan calculator application
 * Features hero section, benefits, and call-to-action
 */
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-blue-50 to-green-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Drift
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced loan simulation with payment scenario analysis. 
              Visualize how extra payments can save you thousands and years of debt.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/loan-calculator"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              data-testid="cta-calculator-button"
            >
              <Calculator className="h-6 w-6" />
              Start Calculating
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Free to use • No registration required
            </div>
          </div>

          {/* Feature Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Interactive Charts
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Visualize loan balance over time with multiple payment scenarios
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Savings Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  See exactly how much interest and time you save with extra payments
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Multiple Scenarios
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Compare up to 3 payment strategies side by side
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Drift?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Make informed decisions about your loans with our comprehensive analysis tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Accurate Calculations
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Precise amortization schedules and payment calculations using industry-standard formulas
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Multi-Currency Support
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Calculate loans in multiple currencies with proper formatting and symbols
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Responsive Design
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Works perfectly on all devices - desktop, tablet, and mobile
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dark Mode Support
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Comfortable viewing experience with automatic dark mode detection
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No Registration Required
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Start calculating immediately without creating an account or providing personal information
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Save Calculations
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Optional account creation to save your calculations and preferences for future reference
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Optimize Your Loan?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover how much you can save with extra payments and make informed decisions about your financial future.
          </p>
          <Link
            to="/loan-calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            data-testid="bottom-cta-button"
          >
            <Calculator className="h-6 w-6" />
            Start Your Analysis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;