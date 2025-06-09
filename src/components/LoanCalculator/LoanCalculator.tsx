import React, { useState, useCallback } from 'react';
import LoanForm from './LoanForm';
import ResultsDisplay from './ResultsDisplay';
import DebtVisualization from '../../DebtVisualization';
import DebtDashboard from '../../DebtDashboard';
import LoanAccountDashboard from '../../LoanAccountDashboard';
import type { LoanFormData, LoanResult, TabType } from '../../types';
import { useLoanCalculation } from '../../hooks';
import { Calculator, TrendingDown, Target, CreditCard } from 'lucide-react';

/**
 * Main loan calculator component that manages tabs and loan calculations
 * Serves as the primary interface for the debt management application
 */
const LoanCalculator: React.FC = () => {
  const [formData, setFormData] = useState<LoanFormData | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Use custom hook for loan calculations with memoization
  const result = useLoanCalculation(formData);

  /**
   * Handle loan calculation form submission
   */
  const handleCalculate = useCallback((data: LoanFormData) => {
    setFormData(data);
    setIsCalculated(true);
  }, []);

  /**
   * Handle tab navigation
   */
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  /**
   * Tab configuration for navigation
   */
  const tabs = [
    { id: 'dashboard' as const, label: 'Debt Dashboard', icon: Target },
    { id: 'accounts' as const, label: 'Loan Accounts', icon: CreditCard },
    { id: 'visualization' as const, label: 'Debt Visualization', icon: TrendingDown },
    { id: 'calculator' as const, label: 'Loan Calculator', icon: Calculator },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Application Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
          Drift
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Find your drift with minimalist debt tracking and loan simulation
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-pressed={activeTab === id}
              aria-label={`Switch to ${label} tab`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <DebtDashboard />}
        
        {activeTab === 'accounts' && <LoanAccountDashboard />}
        
        {activeTab === 'visualization' && <DebtVisualization />}
        
        {activeTab === 'calculator' && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Loan Form */}
            <div className="w-full md:w-1/2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Loan Calculator
                </h2>
                <LoanForm onCalculate={handleCalculate} />
              </div>
            </div>
            
            {/* Results Display */}
            <div className="w-full md:w-1/2">
              {isCalculated && result ? (
                <ResultsDisplay result={result} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center h-full flex items-center justify-center transition-all duration-300">
                  <div className="text-center">
                    <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      Fill out the form and click Calculate to see your loan details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;