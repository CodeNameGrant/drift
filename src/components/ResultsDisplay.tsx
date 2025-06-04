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
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform">
      <div className="p-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Loan Summary
        </h2>
        
        <div className="space-y-6">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Monthly Payment</span>
            <span className="text-3xl font-extrabold text-primary dark:text-primary-lighter">{formatCurrency(monthlyPayment)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Interest</span>
            <span className="text-3xl font-extrabold text-primary dark:text-primary-lighter">{formatCurrency(totalInterest)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Payoff Date</span>
            <span className="text-3xl font-extrabold text-primary dark:text-primary-lighter">{formatDate(payoffDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;