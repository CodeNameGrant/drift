import React, { useState, useMemo } from 'react';
import { Chart } from 'react-charts';
import { DebtAccount } from '../../types/debt';
import { prepareInterestRateData, formatCurrency, formatPercentage } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';
import { BarChart3, Info, TrendingUp, AlertTriangle } from 'lucide-react';

interface InterestRateBarChartProps {
  accounts: DebtAccount[];
}

/**
 * Bar chart component showing interest rate comparison across accounts
 * Features sorted bars, color intensity, account labels, and rate highlighting
 */
const InterestRateBarChart: React.FC<InterestRateBarChartProps> = ({ accounts }) => {
  const { currency } = useCurrency();
  const [focusedDatum, setFocusedDatum] = useState<any>(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    const rateData = prepareInterestRateData(accounts.filter(account => account.is_active));
    
    return [{
      label: 'Interest Rates',
      data: rateData.map(account => ({
        primary: account.name,
        secondary: account.rate,
        balance: account.balance,
        type: account.type,
        color: account.color,
        id: account.id
      }))
    }];
  }, [accounts]);

  // Chart configuration
  const primaryAxis = useMemo(
    () => ({
      getValue: (datum: any) => datum.primary,
      type: 'ordinal' as const,
      position: 'bottom' as const,
      show: true,
      showTicks: true,
      tickLabelStyle: {
        fontSize: '12px',
        textAnchor: 'middle',
        transform: 'rotate(-45deg)'
      }
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum: any) => datum.secondary,
        type: 'linear' as const,
        position: 'left' as const,
        show: true,
        showGrid: true,
        showTicks: true,
        tickCount: 6,
        format: (value: number) => `${value.toFixed(1)}%`,
        min: 0
      }
    ],
    []
  );

  // Helper function to get color based on interest rate
  const getInterestRateColor = (rate: number, maxRate: number): string => {
    const intensity = rate / maxRate;
    if (intensity > 0.8) return '#EF4444'; // High rate - red
    if (intensity > 0.6) return '#F59E0B'; // Medium-high rate - orange
    if (intensity > 0.4) return '#EAB308'; // Medium rate - yellow
    if (intensity > 0.2) return '#22C55E'; // Low-medium rate - green
    return '#3B82F6'; // Low rate - blue
  };

  // Chart styling configuration with color intensity based on rate
  const getSeriesStyle = React.useCallback(
    (series: any) => {
      // Use a gradient of colors based on interest rate
      const maxRate = Math.max(...chartData[0]?.data.map(d => d.secondary) || [0]);
      
      return {
        color: (datum: any) => getInterestRateColor(datum.secondary, maxRate)
      };
    },
    [chartData]
  );

  // Calculate statistics
  const statistics = useMemo(() => {
    const rates = chartData[0]?.data.map(d => d.secondary) || [];
    const balances = chartData[0]?.data.map(d => d.balance) || [];
    
    if (rates.length === 0) return null;
    
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const totalBalance = balances.reduce((sum, balance) => sum + balance, 0);
    
    // Calculate weighted average rate
    const weightedRate = chartData[0]?.data.reduce((sum, account) => {
      return sum + (account.secondary * account.balance);
    }, 0) / totalBalance;
    
    return {
      avgRate,
      maxRate,
      minRate,
      weightedRate,
      totalBalance,
      accountCount: rates.length
    };
  }, [chartData]);

  // Tooltip configuration
  const renderTooltip = React.useCallback(
    ({ datum }: any) => {
      if (!datum) return null;

      const rateLevel = datum.secondary > 15 ? 'High' : datum.secondary > 8 ? 'Medium' : 'Low';
      const rateColor = datum.secondary > 15 ? 'text-red-600' : datum.secondary > 8 ? 'text-orange-600' : 'text-green-600';
      
      // Calculate the actual bar color based on interest rate (same logic as getSeriesStyle)
      const maxRate = Math.max(...chartData[0]?.data.map(d => d.secondary) || [0]);
      const actualBarColor = getInterestRateColor(datum.secondary, maxRate);

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: actualBarColor }}
            />
            <span className="font-medium text-gray-900 dark:text-white">
              {datum.primary}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
              <span className={`font-bold ${rateColor} dark:${rateColor.replace('600', '400')}`}>
                {formatPercentage(datum.secondary)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Rate Level:</span>
              <span className={`font-medium ${rateColor} dark:${rateColor.replace('600', '400')}`}>
                {rateLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Balance:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(datum.balance, currency.code)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {datum.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      );
    },
    [currency, chartData]
  );

  // Loading component
  const ChartLoading: React.FC = () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
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
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load chart. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700" data-testid="interest-rate-bar-chart">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Interest Rate Comparison
        </h3>
      </div>

      {/* Rate Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rate Levels</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">High (15%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium-High (8-15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium (4-8%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Low-Medium (2-4%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Low (0-2%)</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <ChartErrorBoundary>
        <div className="relative h-96 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {chartData[0]?.data.length > 0 ? (
            <React.Suspense fallback={<ChartLoading />}>
              <Chart
                options={{
                  data: chartData,
                  primaryAxis,
                  secondaryAxes,
                  getSeriesStyle,
                  tooltip: {
                    render: renderTooltip
                  },
                  dark: document.documentElement.classList.contains('dark'),
                  padding: {
                    left: 60,
                    right: 30,
                    top: 20,
                    bottom: 80
                  }
                }}
              />
            </React.Suspense>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No interest rate data available
                </p>
              </div>
            </div>
          )}
        </div>
      </ChartErrorBoundary>

      {/* Statistics Summary */}
      {statistics && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPercentage(statistics.weightedRate)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Weighted Avg Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatPercentage(statistics.maxRate)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Highest Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPercentage(statistics.minRate)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Lowest Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {statistics.accountCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Accounts
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High Rate Warning */}
      {statistics && statistics.maxRate > 15 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              High Interest Alert
            </p>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            You have accounts with interest rates above 15%. Consider prioritizing these for faster payoff 
            or exploring refinancing options to reduce interest costs.
          </p>
        </div>
      )}

      {/* Chart Info */}
      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Accounts are sorted by interest rate from highest to lowest. 
          Bar colors indicate rate levels - red for high rates, green for low rates. 
          Hover over bars for detailed account information.
        </p>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only" aria-live="polite">
        {focusedDatum && (
          <span>
            Bar chart showing interest rate comparison. Currently focused on {focusedDatum.primary} 
            with {formatPercentage(focusedDatum.secondary)} interest rate.
          </span>
        )}
      </div>
    </div>
  );
};

export default InterestRateBarChart;