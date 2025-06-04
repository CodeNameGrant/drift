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
    amortizationSchedule
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

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Principal</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Interest</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {amortizationSchedule.map((payment, index) => (
                    <tr key={payment.paymentNumber} className={index === 3 ? 'border-b-2 border-gray-300 dark:border-gray-600' : ''}>
                      <td className="px-3 py-2 text-sm">{payment.paymentNumber}</td>
                      <td className="px-3 py-2 text-sm">{formatDate(payment.date)}</td>
                      <td className="px-3 py-2 text-sm">{formatCurrency(payment.principal, currency.code)}</td>
                      <td className="px-3 py-2 text-sm">{formatCurrency(payment.interest, currency.code)}</td>
                      <td className="px-3 py-2 text-sm">{formatCurrency(payment.balance, currency.code)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;