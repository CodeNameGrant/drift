import React from 'react';
import { LoanResult } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

interface ResultsDisplayProps {
  result: LoanResult | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  const { currency } = useCurrency();
  const {
    monthlyPayment,
    totalInterest,
    payoffDate,
    principalAmount,
    totalAmountRepaid,
    effectiveAnnualRate,
    loanTermYears,
    loanTermMonths,
    costPercentage,
  } = result;

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300">
      <div className="p-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Loan Summary
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Payment</span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatCurrency(monthlyPayment, currency.code)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Interest</span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatCurrency(totalInterest, currency.code)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Repayment</span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatCurrency(totalAmountRepaid, currency.code)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cost of Loan</span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatPercentage(costPercentage)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Term</span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {loanTermYears.toFixed(1)} years
                <span className="block text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({loanTermMonths} months)
                </span>
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payoff Date</span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatDate(payoffDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;