import React, { useState, useMemo } from 'react';
import { Chart } from 'react-charts';
import { DebtAccount } from '../../types/debt';
import { prepareDebtDistributionData, formatCurrency } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';
import { PieChart, Info, Eye, EyeOff } from 'lucide-react';

interface DebtDistributionPieChartProps {
  accounts: DebtAccount[];
}

/**
 * Pie chart component showing debt distribution by account type
 * Features percentage labels, legend, hover tooltips, and interactive visibility controls
 */
const DebtDistributionPieChart: React.FC<DebtDistributionPieChartProps> = ({ accounts }) => {
  const { currency } = useCurrency();
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [focusedDatum, setFocusedDatum] = useState<any>(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    const distributionData = prepareDebtDistributionData(accounts.filter(account => account.is_active));
    
    // Filter out hidden types
    const visibleData = distributionData.filter(item => !hiddenTypes.has(item.label));
    
    return [{
      label: 'Debt Distribution',
      data: visibleData.map(item => ({
        primary: item.label,
        secondary: item.value,
        color: item.color,
        count: item.count,
        accounts: item.accounts
      }))
    }];
  }, [accounts, hiddenTypes]);

  // Chart configuration
  const primaryAxis = useMemo(
    () => ({
      getValue: (datum: any) => datum.primary,
      type: 'ordinal' as const
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum: any) => datum.secondary,
        type: 'linear' as const
      }
    ],
    []
  );

  // Toggle visibility of account types
  const toggleTypeVisibility = (label: string) => {
    setHiddenTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Calculate total visible debt
  const totalVisibleDebt = chartData[0]?.data.reduce((sum, item) => sum + item.secondary, 0) || 0;

  // Tooltip configuration
  const renderTooltip = React.useCallback(
    ({ datum }: any) => {
      if (!datum) return null;

      const percentage = totalVisibleDebt > 0 ? (datum.secondary / totalVisibleDebt * 100) : 0;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: datum.color }}
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {datum.primary}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(datum.secondary, currency.code)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Accounts:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {datum.count}
              </span>
            </div>
          </div>
        </div>
      );
    },
    [currency, totalVisibleDebt]
  );

  // Loading component
  const ChartLoading: React.FC = () => (
    <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  );

  // Error boundary component
  const ChartErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    React.useEffect(() => {
      const handleError = () => setHasError(true);
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
      return (
        <div className="flex items-center justify-center h-80 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load chart. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  };

  // Get all distribution data for legend
  const allDistributionData = useMemo(() => 
    prepareDebtDistributionData(accounts.filter(account => account.is_active)), 
    [accounts]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700" data-testid="debt-distribution-pie-chart">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Debt Distribution by Type
        </h3>
      </div>

      {/* Interactive Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Account Types</h4>
        <div className="grid grid-cols-2 gap-2">
          {allDistributionData.map((item) => {
            const isHidden = hiddenTypes.has(item.label);
            const percentage = totalVisibleDebt > 0 ? (item.value / totalVisibleDebt * 100) : 0;
            
            return (
              <button
                key={item.label}
                onClick={() => toggleTypeVisibility(item.label)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isHidden ? 'opacity-50' : ''
                }`}
                data-testid={`legend-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!isHidden && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                  {isHidden ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Container */}
      <ChartErrorBoundary>
        <div className="relative h-80 w-full">
          {chartData[0]?.data.length > 0 ? (
            <React.Suspense fallback={<ChartLoading />}>
              <Chart
                options={{
                  data: chartData,
                  primaryAxis,
                  secondaryAxes,
                  tooltip: {
                    render: renderTooltip
                  },
                  defaultColors: chartData[0]?.data.map(item => item.color) || [],
                  dark: document.documentElement.classList.contains('dark'),
                  padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                  }
                }}
              />
            </React.Suspense>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {hiddenTypes.size === allDistributionData.length 
                    ? 'All account types are hidden. Click the legend items to show them.'
                    : 'No debt data available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </ChartErrorBoundary>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalVisibleDebt, currency.code, false)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Visible Debt
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {chartData[0]?.data.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Visible Types
            </div>
          </div>
        </div>
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Click on legend items to show/hide account types. Hover over chart segments for detailed information.
        </p>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only" aria-live="polite">
        {focusedDatum && (
          <span>
            Pie chart showing debt distribution. Currently focused on {focusedDatum.primary} 
            with {formatCurrency(focusedDatum.secondary, currency.code)} debt.
          </span>
        )}
      </div>
    </div>
  );
};

export default DebtDistributionPieChart;