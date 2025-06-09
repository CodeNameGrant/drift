import React, { useState } from 'react';
import LoanForm from './LoanForm';
import ResultsDisplay from './ResultsDisplay';
import DebtVisualization from './DebtVisualization';
import DebtDashboard from './DebtDashboard';
import LoanAccountDashboard from './LoanAccountDashboard';
import { LoanFormData, LoanResult } from '../types';
import { calculateLoan } from '../utils';
import { Calculator, TrendingDown, Target, BarChart3, CreditCard } from 'lucide-react';

const LoanCalculator: React.FC = () => {
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'visualization' | 'calculator' | 'accounts'>('dashboard');

  const handleCalculate = (formData: LoanFormData) => {
    const calculatedResult = calculateLoan(formData);
    setResult(calculatedResult);
    setIsCalculated(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Drift</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Find your drift with minimalist debt tracking and loan simulation</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Target className="h-5 w-5" />
            Debt Dashboard
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'accounts'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            Loan Accounts
          </button>
          <button
            onClick={() => setActiveTab('visualization')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'visualization'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="h-5 w-5" />
            Debt Visualization
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'calculator'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="h-5 w-5" />
            Loan Calculator
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DebtDashboard />}
      
      {activeTab === 'accounts' && <LoanAccountDashboard />}
      
      {activeTab === 'visualization' && <DebtVisualization />}
      
      {activeTab === 'calculator' && (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Loan Calculator
              </h2>
              <LoanForm onCalculate={handleCalculate} />
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            {isCalculated ? (
              <ResultsDisplay result={result} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center h-full flex items-center justify-center transition-all duration-300">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Fill out the form and click Calculate to see your loan details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;