import React from 'react';
import { TrendingDown, CreditCard, Calendar, Percent, DollarSign, PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';

interface DashboardOverviewProps {
  summary: {
    totalOutstandingDebt: number;
    totalMonthlyPayments: number;
    numberOfActiveAccounts: number;
    averageInterestRate: number;
    totalPaid: number;
    projectedPayoffDate: Date;
  };
}

/**
 * Dashboard overview component displaying key debt metrics and visualizations
 * Features responsive cards, metric highlights, and placeholder chart areas
 */
const DashboardOverview: React.FC<DashboardOverviewProps> = ({ summary }) => {
  const { currency } = useCurrency();

  const metrics = [
    {
      title: 'Total Outstanding Debt',
      value: formatCurrency(summary.totalOutstandingDebt, currency.code),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      title: 'Total Monthly Payments',
      value: formatCurrency(summary.totalMonthlyPayments, currency.code),
      icon: DollarSign,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Active Accounts',
      value: summary.numberOfActiveAccounts.toString(),
      icon: CreditCard,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Average Interest Rate',
      value: formatPercentage(summary.averageInterestRate),
      icon: Percent,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-overview">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <div
              key={index}
              className={`${metric.bgColor} ${metric.borderColor} border rounded-lg p-6 transition-all duration-300 hover:shadow-lg`}
              data-testid={`metric-card-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Summary Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress Summary
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Paid Off:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalPaid, currency.code)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Projected Debt-Free Date:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatDate(summary.projectedPayoffDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Stats
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Payment Ratio:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {(summary.totalOutstandingDebt / summary.totalMonthlyPayments / 12).toFixed(1)} years
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Interest Cost:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(
                  summary.totalOutstandingDebt * (summary.averageInterestRate / 100 / 12),
                  currency.code
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualization Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Debt Distribution
            </h3>
          </div>
          <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pie chart showing debt by account type
              </p>
            </div>
          </div>
        </div>

        {/* Line Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payoff Progress
            </h3>
          </div>
          <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Line chart tracking debt reduction over time
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interest Rates
            </h3>
          </div>
          <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bar chart comparing interest rates across accounts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;