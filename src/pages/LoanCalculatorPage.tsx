import React from 'react';
import LoanCalculator from '../components/LoanCalculator/LoanCalculator';
import { Calculator } from 'lucide-react';

/**
 * Loan Calculator page component
 * Dedicated page for the loan calculation functionality
 */
const LoanCalculatorPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8" data-testid="loan-calculator-page">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Loan Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Advanced loan simulation with payment scenario analysis. 
            Compare different payment strategies and see how extra payments can save you money and time.
          </p>
        </div>

        {/* Calculator Component */}
        <LoanCalculator />
      </div>
    </div>
  );
};

export default LoanCalculatorPage;