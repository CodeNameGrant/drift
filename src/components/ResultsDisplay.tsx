import React from 'react';
import { LoanResult } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface ResultsDisplayProps {
  result: LoanResult | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  const { monthlyPayment, totalInterest, payoffDate } = result;

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform">
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
          Loan Summary
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlyPayment)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Interest</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalInterest)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Payoff Date</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatDate(payoffDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;