import React from 'react';
import { LoanResult } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import { TrendingDown, Calendar, DollarSign, Percent, Clock, PiggyBank } from 'lucide-react';

interface ComparisonTableProps {
  result: LoanResult;
}

/**
 * Comprehensive comparison table component showing all loan scenarios side by side
 * Features color-coded indicators, responsive design, and accessibility
 */
const ComparisonTable: React.FC<ComparisonTableProps> = ({ result }) => {
  const { currency } = useCurrency();
  const { baseScenario, simulation1, simulation2 } = result;

  const scenarios = [baseScenario, simulation1, simulation2];

  /**
   * Calculate savings compared to base scenario
   */
  const calculateSavings = (scenario: any, isBase: boolean = false) => {
    if (isBase) return null;
    
    return {
      interestSaved: baseScenario.totalInterest - scenario.totalInterest,
      timeSaved: baseScenario.loanTermMonths - scenario.loanTermMonths,
      totalSaved: baseScenario.totalAmountRepaid - scenario.totalAmountRepaid
    };
  };

  /**
   * Render table cell with color indicator
   */
  const renderCell = (value: string | number, scenario: any, isHeader: boolean = false) => {
    if (isHeader) {
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: scenario.color }}
            aria-hidden="true"
          />
          <span className="font-semibold text-gray-900 dark:text-white">
            {scenario.scenarioName}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: scenario.color }}
          aria-hidden="true"
        />
        <span className="text-gray-900 dark:text-white font-medium">
          {value}
        </span>
      </div>
    );
  };

  /**
   * Render savings indicator for simulations
   */
  const renderSavings = (savings: any) => {
    if (!savings) return null;

    return (
      <div className="mt-1 text-xs space-y-1">
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <PiggyBank className="h-3 w-3" />
          <span>Save {formatCurrency(savings.interestSaved, currency.code, false)}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <Clock className="h-3 w-3" />
          <span>Save {(savings.timeSaved / 12).toFixed(1)} years</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6" data-testid="comparison-table">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Payment Scenarios Comparison
        </h3>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Metric
              </th>
              {scenarios.map((scenario, index) => (
                <th key={index} className="text-left py-4 px-4 min-w-[200px]">
                  {renderCell('', scenario, true)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Monthly Payment */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Monthly Payment
                  </span>
                </div>
              </td>
              {scenarios.map((scenario, index) => (
                <td key={index} className="py-4 px-4">
                  {renderCell(formatCurrency(scenario.monthlyPayment, currency.code), scenario)}
                  {index > 0 && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      +{formatCurrency(scenario.extraPayment, currency.code, false)} extra
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Total Interest */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Interest
                  </span>
                </div>
              </td>
              {scenarios.map((scenario, index) => (
                <td key={index} className="py-4 px-4">
                  <div>
                    {renderCell(formatCurrency(scenario.totalInterest, currency.code), scenario)}
                    {renderSavings(calculateSavings(scenario, index === 0))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Total Amount Repaid */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Repayment
                  </span>
                </div>
              </td>
              {scenarios.map((scenario, index) => (
                <td key={index} className="py-4 px-4">
                  {renderCell(formatCurrency(scenario.totalAmountRepaid, currency.code), scenario)}
                </td>
              ))}
            </tr>

            {/* Payoff Date */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payoff Date
                  </span>
                </div>
              </td>
              {scenarios.map((scenario, index) => (
                <td key={index} className="py-4 px-4">
                  {renderCell(formatDate(scenario.payoffDate), scenario)}
                </td>
              ))}
            </tr>

            {/* Loan Term */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Term
                  </span>
                </div>
              </td>
              {scenarios.map((scenario, index) => (
                <td key={index} className="py-4 px-4">
                  {renderCell(
                    `${scenario.loanTermYears.toFixed(1)} years (${scenario.loanTermMonths} months)`,
                    scenario
                  )}
                </td>
              ))}
            </tr>

            {/* Cost Percentage */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cost of Loan
                  </span>
                </div>
              </td>
              {scenarios.map((scenario, index) => (
                <td key={index} className="py-4 px-4">
                  {renderCell(formatPercentage(scenario.costPercentage), scenario)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {scenarios.map((scenario, index) => {
          const savings = calculateSavings(scenario, index === 0);
          
          return (
            <div 
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              style={{ borderLeftColor: scenario.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: scenario.color }}
                  aria-hidden="true"
                />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {scenario.scenarioName}
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</span>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(scenario.monthlyPayment, currency.code)}
                    </div>
                    {index > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{formatCurrency(scenario.extraPayment, currency.code, false)} extra
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Interest</span>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(scenario.totalInterest, currency.code)}
                    </div>
                    {savings && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Save {formatCurrency(savings.interestSaved, currency.code, false)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Repayment</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(scenario.totalAmountRepaid, currency.code)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payoff Date</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(scenario.payoffDate)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loan Term</span>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {scenario.loanTermYears.toFixed(1)} years
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ({scenario.loanTermMonths} months)
                    </div>
                    {savings && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Save {(savings.timeSaved / 12).toFixed(1)} years
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost of Loan</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatPercentage(scenario.costPercentage)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Savings Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulation 1 Savings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Simulation 1 Benefits
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Interest Saved:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(baseScenario.totalInterest - simulation1.totalInterest, currency.code)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time Saved:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {((baseScenario.loanTermMonths - simulation1.loanTermMonths) / 12).toFixed(1)} years
                </span>
              </div>
            </div>
          </div>

          {/* Simulation 2 Savings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Simulation 2 Benefits
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Interest Saved:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {formatCurrency(baseScenario.totalInterest - simulation2.totalInterest, currency.code)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time Saved:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {((baseScenario.loanTermMonths - simulation2.loanTermMonths) / 12).toFixed(1)} years
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;