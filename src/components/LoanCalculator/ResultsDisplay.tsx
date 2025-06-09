import React, { memo } from 'react';
import type { LoanResult } from '../../types';
import { formatCurrency, formatDate, formatPercentage } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';

interface ResultsDisplayProps {
  /** Loan calculation results to display */
  result: LoanResult | null;
}

/**
 * Results display component for loan calculations
 * Shows comprehensive loan information including payments, interest, and timeline
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = memo(({ result }) => {
  const { currency } = useCurrency();

  // Return null if no results to display
  if (!result) return null;

  const {
    monthlyPayment,
    totalInterest,
    payoffDate,
    totalAmountRepaid,
    loanTermYears,
    loanTermMonths,
    costPercentage,
  } = result;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300">
      <div className="p-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Loan Summary
        </h2>
        
        <div className="space-y-6">
          {/* Primary Metrics */}
          <div className="grid grid-cols-2 gap-6">            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Monthly Payment
              </span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatCurrency(monthlyPayment, currency.code)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Interest
              </span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatCurrency(totalInterest, currency.code)}
              </span>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Repayment
              </span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatCurrency(totalAmountRepaid, currency.code)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Cost of Loan
              </span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatPercentage(costPercentage)}
              </span>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Term
              </span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {loanTermYears.toFixed(1)} years
                <span className="block text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({loanTermMonths} months)
                </span>
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Payoff Date
              </span>
              <span className="text-xl font-bold text-primary dark:text-primary-light">
                {formatDate(payoffDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ResultsDisplay.displayName = 'ResultsDisplay';

export default ResultsDisplay;