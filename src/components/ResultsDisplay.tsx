import React from 'react';
import { LoanResult } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import { TrendingDown, Calendar, DollarSign, Percent } from 'lucide-react';

interface ResultsDisplayProps {
  result: LoanResult | null;
}

/**
 * Enhanced results display component showing active payment scenarios
 * Dynamically shows only scenarios with valid extra payments
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  const { currency } = useCurrency();
  const { baseScenario, simulation1, simulation2 } = result;

  // Determine which scenarios to display
  const activeScenarios = [baseScenario];
  
  if (simulation1.extraPayment > 0) {
    activeScenarios.push(simulation1);
  }
  
  if (simulation2.extraPayment > 0) {
    activeScenarios.push(simulation2);
  }

  /**
   * Render individual scenario card with comprehensive metrics
   */
  const renderScenarioCard = (scenario: any, isBase: boolean = false) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 transition-all duration-300 hover:shadow-xl`}
      style={{ borderLeftColor: scenario.color }}
      data-testid={`scenario-card-${scenario.scenarioName.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: scenario.color }}
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {scenario.scenarioName}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Monthly Payment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</span>
          </div>
          <span className="text-lg font-bold text-primary dark:text-primary-light">
            {formatCurrency(scenario.monthlyPayment, currency.code)}
          </span>
        </div>

        {/* Total Interest */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Interest</span>
          </div>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(scenario.totalInterest, currency.code)}
          </span>
        </div>

        {/* Total Repayment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Repayment</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(scenario.totalAmountRepaid, currency.code)}
          </span>
        </div>

        {/* Payoff Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Payoff Date</span>
          </div>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatDate(scenario.payoffDate)}
          </span>
        </div>

        {/* Loan Term */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Term</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {scenario.loanTermYears.toFixed(1)} years ({scenario.loanTermMonths} months)
          </span>
        </div>

        {/* Cost Percentage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cost of Loan</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatPercentage(scenario.costPercentage)}
          </span>
        </div>

        {/* Savings Comparison (for simulations) */}
        {!isBase && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Interest Saved</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(baseScenario.totalInterest - scenario.totalInterest, currency.code)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Time Saved</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {((baseScenario.loanTermMonths - scenario.loanTermMonths) / 12).toFixed(1)} years
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6" data-testid="results-display">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Loan Payment Scenarios
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {activeScenarios.length === 1 
            ? 'Your base loan scenario' 
            : `Compare ${activeScenarios.length} payment scenarios and see how extra payments affect your loan`
          }
        </p>
      </div>

      <div className={`grid gap-6 ${
        activeScenarios.length === 1 
          ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
          : activeScenarios.length === 2 
          ? 'md:grid-cols-1 lg:grid-cols-2' 
          : 'md:grid-cols-1 lg:grid-cols-3'
      }`}>
        {activeScenarios.map((scenario, index) => 
          renderScenarioCard(scenario, index === 0)
        )}
      </div>

      {/* Summary Comparison - Only show if there are simulations */}
      {activeScenarios.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Comparison Summary
          </h3>
          <div className={`grid gap-4 text-center ${
            activeScenarios.length === 2 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-3'
          }`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(baseScenario.totalInterest, currency.code, false)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Base Interest</div>
            </div>
            
            {simulation1.extraPayment > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(baseScenario.totalInterest - simulation1.totalInterest, currency.code, false)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sim 1 Savings</div>
              </div>
            )}
            
            {simulation2.extraPayment > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(baseScenario.totalInterest - simulation2.totalInterest, currency.code, false)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sim 2 Savings</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;