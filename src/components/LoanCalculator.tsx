import React, { useState } from 'react';
import LoanForm from './LoanForm';
import ResultsDisplay from './ResultsDisplay';
import LoanChart from './LoanChart';
import ComparisonTable from './ComparisonTable';
import { LoanFormData, LoanResult } from '../types';
import { calculateLoan } from '../utils/calculations';

/**
 * Main loan calculator component orchestrating form, results, chart, and comparison table
 * Handles state management and calculation coordination with improved layout
 */
const LoanCalculator: React.FC = () => {
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  /**
   * Handle loan calculation with enhanced scenarios
   */
  const handleCalculate = (formData: LoanFormData) => {
    const calculatedResult = calculateLoan(formData);
    setResult(calculatedResult);
    setIsCalculated(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6" data-testid="loan-calculator">
      <div className="text-center mb-12">
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Advanced loan simulation with payment scenario analysis
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Form Section - Now Full Width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Loan Calculator
          </h2>
          <LoanForm onCalculate={handleCalculate} />
        </div>

        {/* Results Section */}
        {isCalculated && result ? (
          <div className="space-y-8">
            <ComparisonTable result={result} />
            <ResultsDisplay result={result} />
            <LoanChart result={result} />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center transition-all duration-300">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Fill out the form and click Calculate to see your loan scenarios and interactive visualization
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;