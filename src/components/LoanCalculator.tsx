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
    <div className="space-y-8">
      {/* Form Section */}
      <div>
        <LoanForm onCalculate={handleCalculate} />
      </div>
      
      {/* Results Section - Only show when calculated */}
      {isCalculated && result && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <ResultsDisplay result={result} />
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;