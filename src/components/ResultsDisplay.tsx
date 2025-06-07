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
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Payment</span>
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-primary dark:text-primary-light">
            {formatCurrency(monthlyPayment, currency.code)}
          </span>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Interest</span>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalInterest, currency.code)}
          </span>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Repayment
          </span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalAmountRepaid, currency.code)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Cost of Loan
          </span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatPercentage(costPercentage)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Term
          </span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {loanTermYears.toFixed(1)} years
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ({loanTermMonths} months)
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Payoff Date
          </span>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatDate(payoffDate)}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Loan Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Principal Amount:</span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(principalAmount, currency.code)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Effective Annual Rate:</span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatPercentage(effectiveAnnualRate)}
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalInterest, currency.code)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;