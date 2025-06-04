import React, { useState } from 'react';
import LoanForm from './LoanForm';
import ResultsDisplay from './ResultsDisplay';
import { LoanFormData, LoanResult } from '../types';
import { calculateLoan } from '../utils/calculations';

const LoanCalculator: React.FC = () => {
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleCalculate = (formData: LoanFormData) => {
    const calculatedResult = calculateLoan(formData);
    setResult(calculatedResult);
    setIsCalculated(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-primary dark:text-primary-dark mb-3 tracking-tight">Drift</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Minimalist debt tracking and loan simulation</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2">
          <div className="bg-cardBackground-light dark:bg-cardBackground-dark rounded-lg shadow-xl p-8 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Loan Calculator
            </h2>
            <LoanForm onCalculate={handleCalculate} />
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          {isCalculated ? (
            <ResultsDisplay result={result} />
          ) : (
            <div className="bg-cardBackground-light dark:bg-cardBackground-dark rounded-lg shadow-xl p-8 text-center h-full flex items-center justify-center transition-all duration-300">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Fill out the form and click Calculate to see your loan details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator